import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { WristbandAuthService } from '../auth.service';
import { NextFunction, Response } from 'express';
import { RequestWithSession } from '../types';
import { errorResponse } from '../utils/server-utils';

@Injectable()
export class WristbandAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(WristbandAuthService)
    private readonly wristbandAuth: WristbandAuthService,
  ) {}
  async use(req: RequestWithSession, res: Response, next: NextFunction) {
    const { csrfSecret, expiresAt, isAuthenticated, refreshToken } =
      req.session;

    if (!isAuthenticated || !csrfSecret) {
      return res.status(401).send();
    }

    try {
      const tokenData = await this.wristbandAuth.getRefreshTokenIfExpired(
        refreshToken,
        expiresAt,
      );
      if (tokenData) {
        req.session.accessToken = tokenData.accessToken;
        // Converts the "expiresIn" seconds into a Unix timestamp in milliseconds at which the token expires.
        req.session.expiresAt =
          Date.now() + tokenData.expiresIn * 1000;
        req.session.refreshToken = tokenData.refreshToken;
      }
      // Save the session in order to "touch" it (even if there is no new token data).
      await req.session.save();
      return next();
    } catch (error) {
      console.error(errorResponse(500, error));
      return res.status(401).send();
    }
  }
}
