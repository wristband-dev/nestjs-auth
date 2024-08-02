import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { WristbandAuthService } from './auth.service';
import { SessionService } from './utils/session.service';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let wristbandAuthService: Partial<WristbandAuthService>;
  let sessionService: Partial<SessionService>;

  beforeEach(async () => {
    wristbandAuthService = {
      getCsrfTokenCookieName: jest.fn().mockReturnValue('csrfToken'),
    };

    sessionService = {
      updateCsrfTokenAndCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: WristbandAuthService, useValue: wristbandAuthService },
        { provide: SessionService, useValue: sessionService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should return isAuthenticated true when session is authenticated', async () => {
    const req = {
      session: {
        isAuthenticated: true,
        csrfSecret: 'someCsrfSecret',
      },
    } as any;

    const res = {
      header: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any as Response;

    await authController.authState(req, res);

    expect(res.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.header).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(sessionService.updateCsrfTokenAndCookie).toHaveBeenCalledWith(req, res, 'csrfToken');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ isAuthenticated: true });
  });

  it('should return isAuthenticated false when session is not authenticated', async () => {
    const req = {
      session: {
        isAuthenticated: false,
      },
    } as any;

    const res = {
      header: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any as Response;

    await authController.authState(req, res);

    expect(res.header).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.header).toHaveBeenCalledWith('Pragma', 'no-cache');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ isAuthenticated: false });
  });
});
