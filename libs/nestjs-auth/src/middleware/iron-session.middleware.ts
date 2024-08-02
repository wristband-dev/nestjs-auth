import { Injectable, NestMiddleware } from '@nestjs/common';
import { getIronSession, SessionOptions } from 'iron-session';
import { NextFunction, Response } from 'express';
import { WristbandAuthService } from '../auth.service';
import { RequestWithSession } from '../types';

// Middleware to initialize Iron Session cookie-based sessions for the application.
// https://github.com/vvo/iron-session/issues/586#issuecomment-1825671315
const ironSession = (sessionOptions: SessionOptions) => {
  return async function ironSessionMiddleware(
    req: RequestWithSession,
    res: Response,
    next: NextFunction,
  ) {
    req.session = await getIronSession(req, res, sessionOptions);
    next();
  };
};

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly wristbandAuth: WristbandAuthService) {}
  use(req: RequestWithSession, res: Response, next: NextFunction) {
    ironSession({
      cookieName: this.wristbandAuth.getSessionCookieName(),
      password: this.wristbandAuth.getSessionCookieSecret(),
      cookieOptions: {
        httpOnly: true,
        maxAge: this.wristbandAuth.getSessionCookieMaxAge(),
        path: '/',
        sameSite: 'lax',
        secure: this.wristbandAuth.getSecureCookiesEnabled(),
      },
    })(req, res, next);
  }
}
