import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import Tokens from 'csrf';
import { WristbandAuthService } from '../auth.service';
import { RequestWithSession } from '../types';

@Injectable()
export class SessionService {
  constructor(private wristbandAuth: WristbandAuthService) {}
  private csrfTokens = new Tokens();
  private sessionCookieAge = this.wristbandAuth.getSessionCookieMaxAge();
  private secureCookiesEnabled = this.wristbandAuth.getSecureCookiesEnabled();

  // Convert the "expiresIn" seconds into an expiration date with the format of milliseconds from the epoch.
  // Adds a 5 minute safety buffer to the token expiration time.
  expiresAtWithBuffer(numOfSeconds: number) {
    const secondsWithBuffer = numOfSeconds - 300;
    return Date.now().toLocaleString() + secondsWithBuffer * 1000;
  }

  createCsrfSecret() {
    return this.csrfTokens.secretSync();
  }

  isCsrfTokenValid(req: RequestWithSession) {
    const xsrfToken = Array.isArray(req.headers['x-xsrf-token'])
      ? req.headers['x-xsrf-token'][0]
      : req.headers['x-xsrf-token'];
    return this.csrfTokens.verify(req.session.csrfSecret, xsrfToken);
  }

  updateCsrfTokenAndCookie(
    req: RequestWithSession,
    res: Response,
    cookieName: string,
  ) {
    const csrfToken = this.csrfTokens.create(req.session.csrfSecret);
    return res.cookie(cookieName, csrfToken, {
      httpOnly: false,
      maxAge: this.sessionCookieAge * 1000,
      path: '/',
      sameSite: true,
      secure: this.secureCookiesEnabled,
    });
  }
}
