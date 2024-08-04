import { Test, TestingModule } from '@nestjs/testing';
import { WristbandAuthMiddleware } from './wristband-auth.middleware';
import { WristbandAuthService } from '../auth.service';
import { RequestWithSession } from '../types';
import { Response } from 'express';

describe('WristbandAuthMiddleware', () => {
  let middleware: WristbandAuthMiddleware;
  let wristbandAuthService: Partial<WristbandAuthService>;

  beforeEach(async () => {
    wristbandAuthService = {
      getRefreshTokenIfExpired: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WristbandAuthMiddleware,
        { provide: WristbandAuthService, useValue: wristbandAuthService },
      ],
    }).compile();

    middleware = module.get<WristbandAuthMiddleware>(WristbandAuthMiddleware);
  });

  it('should return 401 if not authenticated', async () => {
    const req = {
      session: {
        isAuthenticated: false,
        csrfSecret: null,
      },
    } as unknown as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if csrfSecret is missing', async () => {
    const req = {
      session: {
        isAuthenticated: true,
        csrfSecret: null,
      },
    } as unknown as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should refresh token if expired and save session', async () => {
    const mockCurrentTime = Number(1722540605199); // Mocked current time
    jest.spyOn(Date, 'now').mockImplementation(() => mockCurrentTime);

    const req = {
      session: {
        isAuthenticated: true,
        csrfSecret: 'csrfSecret',
        refreshToken: 'oldRefreshToken',
        expiresAt: mockCurrentTime - 1000, // expired
        save: jest.fn(),
      },
    } as unknown as RequestWithSession;
    const res = {} as Response;
    const next = jest.fn();

    const tokenData = {
      accessToken: 'newAccessToken',
      expiresIn: 1800,
      refreshToken: 'newRefreshToken',
    };

    (wristbandAuthService.getRefreshTokenIfExpired as jest.Mock).mockResolvedValue(tokenData);

    await middleware.use(req, res, next);
    expect(req.session.accessToken).toBe(tokenData.accessToken);
    expect(req.session.expiresAt).toBe(mockCurrentTime + tokenData.expiresIn * 1000);
    expect(req.session.refreshToken).toBe(tokenData.refreshToken);
    expect(req.session.save).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should handle errors and return 401', async () => {
    const req = {
      session: {
        isAuthenticated: true,
        csrfSecret: 'csrfSecret',
        refreshToken: 'oldRefreshToken',
        expiresAt: Date.now() - 1000, // expired
        save: jest.fn(),
      },
    } as unknown as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const error = new Error('Test error');
    (wristbandAuthService.getRefreshTokenIfExpired as jest.Mock).mockRejectedValue(error);

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});