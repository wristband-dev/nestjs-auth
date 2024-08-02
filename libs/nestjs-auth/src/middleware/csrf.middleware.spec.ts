import { Test, TestingModule } from '@nestjs/testing';
import { CsrfMiddleware } from './csrf.middleware';
import { SessionService } from '../utils/session.service';
import { WristbandAuthService } from '../auth.service';
import { RequestWithSession } from '../types';
import { Response, NextFunction } from 'express';

describe('CsrfMiddleware', () => {
  let csrfMiddleware: CsrfMiddleware;
  let sessionService: SessionService;
  let wristbandAuth: WristbandAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsrfMiddleware,
        {
          provide: SessionService,
          useValue: {
            isCsrfTokenValid: jest.fn(),
            updateCsrfTokenAndCookie: jest.fn(),
          },
        },
        {
          provide: WristbandAuthService,
          useValue: {
            getCsrfTokenCookieName: jest.fn(),
          },
        },
      ],
    }).compile();

    csrfMiddleware = module.get<CsrfMiddleware>(CsrfMiddleware);
    sessionService = module.get<SessionService>(SessionService);
    wristbandAuth = module.get<WristbandAuthService>(WristbandAuthService);
  });

  it('should return 401 if CSRF token is invalid', () => {
    const req = {} as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    (sessionService.isCsrfTokenValid as jest.Mock).mockReturnValue(false);

    csrfMiddleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if CSRF token is valid', () => {
    const req = {} as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    (sessionService.isCsrfTokenValid as jest.Mock).mockReturnValue(true);
    (wristbandAuth.getCsrfTokenCookieName as jest.Mock).mockReturnValue(
      'csrfToken',
    );

    csrfMiddleware.use(req, res, next);

    expect(sessionService.updateCsrfTokenAndCookie).toHaveBeenCalledWith(
      req,
      res,
      'csrfToken',
    );
    expect(next).toHaveBeenCalled();
  });
});
