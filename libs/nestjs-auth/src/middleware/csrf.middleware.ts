import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionService } from '../utils/session.service';
import { WristbandAuthService } from '../auth.service';
import { Response, NextFunction } from 'express';
import { RequestWithSession } from '../types';

// Middleware that validates that a CSRF token is present in the request header and is valid
// when compared against the secret stored in the user's session store. After validation,
// a new CSRF token is generated and set into the CSRF response cookie. This cookie has the same
// max age as the session cookie since the CSRF secret is stored in the user's session store.
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(
    private readonly sessionService: SessionService,
    private readonly wristbandAuth: WristbandAuthService,
  ) {}

  use(req: RequestWithSession, res: Response, next: NextFunction) {
    if (!this.sessionService.isCsrfTokenValid(req)) {
      return res.status(401).send();
    }
    const cookieName = this.wristbandAuth.getCsrfTokenCookieName();
    this.sessionService.updateCsrfTokenAndCookie(req, res, cookieName as unknown as string);
    return next();
  }
}
