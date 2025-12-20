import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { SessionOptions } from '@wristband/express-auth';
import { createWristbandSession } from '@wristband/express-auth/session';

import { SESSION_OPTIONS_TOKEN } from '../constants';

/**
 * NestJS middleware for Wristband session management.
 *
 * This middleware wraps the Wristband express-auth session middleware to provide session
 * functionality in NestJS applications. It handles session creation, persistence, and
 * management using secure, encrypted cookies.
 *
 * The middleware automatically:
 * - Creates and manages encrypted session cookies
 * - Handles session lifecycle (creation, updates, destruction)
 * - Supports CSRF protection when enabled
 * - Provides session data access via `req.session`
 *
 * NOTE: Importing this middleware automatically augments `Express.Request` with the `session` property.
 *
 * @remarks
 * This middleware should be applied globally in your application to ensure sessions are
 * available to all routes. It is typically configured through `WristbandExpressSessionModule`.
 *
 * @see {@link WristbandExpressSessionModule} for module configuration
 * @see {@link SessionOptions} for available session configuration options
 *
 * @example
 * ```typescript
 * // Apply globally in AppModule
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(WristbandExpressSessionMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Access session in a controller
 * import '@wristband/nestjs-auth/session'; // Enable req.session typing
 *
 * @Controller('api')
 * export class MyController {
 *   @Get('user')
 *   getUser(@Req() req: Request) {
 *     const userId = req.session.userId;
 *     return { userId };
 *   }
 * }
 * ```
 */
@Injectable()
export class WristbandExpressSessionMiddleware implements NestMiddleware {
  private sessionMiddleware: any;

  /**
   * Creates an instance of WristbandExpressSessionMiddleware.
   *
   * The session middleware is created once during construction and reused for all requests,
   * ensuring optimal performance and consistent session behavior.
   *
   * @param sessionOptions - Configuration options for session management, injected via SESSION_OPTIONS_TOKEN
   */
  constructor(
    @Inject(SESSION_OPTIONS_TOKEN)
    sessionOptions: SessionOptions
  ) {
    this.sessionMiddleware = createWristbandSession(sessionOptions);
  }

  /**
   * Middleware handler that processes session for each request.
   *
   * This method is called for every request that passes through this middleware.
   * It delegates to the underlying Wristband session middleware to handle session
   * creation, retrieval, and persistence.
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function to pass control to the next middleware
   * @returns Promise that resolves when session processing is complete
   */
  async use(req: Request, res: Response, next: NextFunction) {
    return this.sessionMiddleware(req, res, next);
  }
}
