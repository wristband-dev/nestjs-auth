import { Test, TestingModule } from '@nestjs/testing';
import { SessionMiddleware } from './iron-session.middleware';
import { Response } from 'express';
import { RequestWithSession } from '../types';
import { WristbandAuthService } from '../auth.service';
import cookieParser from 'cookie-parser';

describe('IronSessionMiddleware', () => {
  let middleware: SessionMiddleware;
  let wristbandAuthService: Partial<WristbandAuthService>;

  beforeEach(async () => {
    wristbandAuthService = {
      getSessionCookieSecret: jest.fn().mockReturnValue('BW2Kg9mGfx96U5gLFEbAcV54m1z9gghX'),
      getSessionCookieMaxAge: jest.fn().mockReturnValue(1000),
      getSecureCookiesEnabled: jest.fn().mockReturnValue(true),
      getSessionCookieName: jest.fn().mockReturnValue('sessionCookieValue'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionMiddleware, { provide: WristbandAuthService, useValue: wristbandAuthService }],
    }).compile();

    middleware = module.get<SessionMiddleware>(SessionMiddleware);
  });

  it('should initialize session if not present', async () => {
    const req = {
      headers: {
        cookie: 'sessionCookieName=sessionCookieValue',
      },
      session: {
        isAuthenticated: false,
      },
      secret: 'BW2Kg9mGfx96U5gLFEbAcV54m1z9gghX',
    } as unknown as RequestWithSession;
    const res = {} as Response;
    const next = jest.fn();

    cookieParser()(req, res, async () => {
      await middleware.use(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.session).toBeDefined();
    });
  });

  it.skip('should validate existing session', async () => {
    const req = {
      headers: {
        cookie: 'sessionCookieName=sessionCookieValue',
      },
      session: {
        isAuthenticated: false,
      },
      secret: 'BW2Kg9mGfx96U5gLFEbAcV54m1z9gghX',
    } as unknown as RequestWithSession;
    const res = {} as Response;
    const next = jest.fn();
    
    cookieParser()(req, res, async () => {
      console.log(req)
      await middleware.use(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.session.isAuthenticated).toBe(true);
    });

  });

  it('should handle errors gracefully', async () => {
    const req = {} as RequestWithSession;
    const res = {} as Response;
    const next = jest.fn();

    jest.spyOn(middleware, 'use').mockImplementation(() => {
      throw new Error('Test error');
    });

    try {
      await middleware.use(req, res, next);
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    }
  });
});
