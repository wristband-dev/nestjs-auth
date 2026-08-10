import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response, NextFunction } from 'express';
import type { SessionOptions } from '@wristband/express-auth';
import { createWristbandSession } from '@wristband/express-auth/session';

import { WristbandExpressSessionMiddleware } from '../../../src/express/session/session.middleware';
import { SESSION_OPTIONS_TOKEN } from '../../../src/express/constants';

// Mock the createWristbandSession function
jest.mock('@wristband/express-auth/session', () => ({
  createWristbandSession: jest.fn(),
}));

describe('WristbandExpressSessionMiddleware', () => {
  let middleware: WristbandExpressSessionMiddleware;
  let mockSessionMiddleware: jest.Mock;
  let sessionOptions: SessionOptions;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock session middleware function
    mockSessionMiddleware = jest.fn((req, res, next) => next());
    (createWristbandSession as jest.Mock).mockReturnValue(mockSessionMiddleware);

    // Define session options
    sessionOptions = {
      secrets: 'test-secret',
      secure: false,
      enableCsrfProtection: true,
    };

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WristbandExpressSessionMiddleware,
        {
          provide: SESSION_OPTIONS_TOKEN,
          useValue: sessionOptions,
        },
      ],
    }).compile();

    middleware = module.get<WristbandExpressSessionMiddleware>(WristbandExpressSessionMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call createWristbandSession with session options on construction', () => {
    expect(createWristbandSession).toHaveBeenCalledWith(sessionOptions);
    expect(createWristbandSession).toHaveBeenCalledTimes(1);
  });

  it('should call the underlying session middleware when use() is called', async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    await middleware.use(mockReq, mockRes, mockNext);

    expect(mockSessionMiddleware).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
  });

  it('should pass through errors from the session middleware', async () => {
    const mockError = new Error('Session error');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockSessionMiddleware.mockImplementation((req, res, next) => {
      throw mockError;
    });

    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    await expect(middleware.use(mockReq, mockRes, mockNext)).rejects.toThrow('Session error');
  });

  it('should create only one session middleware instance', async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    // Call use multiple times
    await middleware.use(mockReq, mockRes, mockNext);
    await middleware.use(mockReq, mockRes, mockNext);
    await middleware.use(mockReq, mockRes, mockNext);

    // createWristbandSession should only be called once (in constructor)
    expect(createWristbandSession).toHaveBeenCalledTimes(1);

    // But the middleware function should be called each time
    expect(mockSessionMiddleware).toHaveBeenCalledTimes(3);
  });
});
