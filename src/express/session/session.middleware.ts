import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { SessionOptions } from '@wristband/typescript-session';

import { SESSION_OPTIONS_TOKEN } from '../constants';
import { createWristbandSession } from './create-wristband-session';

/**
 * NestJS middleware for Wristband session management.
 *
 * This middleware wraps Wristband session handling to provide session
 * functionality in NestJS applications. It handles session creation, persistence, and
 * management using secure, encrypted cookies.
 *
 * NOTE: Importing this middleware automatically augments `Express.Request` with the `session` property.
 */
@Injectable()
export class WristbandExpressSessionMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sessionMiddleware: any;

  constructor(
    @Inject(SESSION_OPTIONS_TOKEN)
    sessionOptions: SessionOptions
  ) {
    this.sessionMiddleware = createWristbandSession(sessionOptions);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    return this.sessionMiddleware(req, res, next);
  }
}
