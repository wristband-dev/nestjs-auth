/**
 * Session Module
 *
 * Importing this automatically augments Express.Request with the `session` property
 * because the middleware imports from @wristband/express-auth/session
 */
export { WristbandExpressSessionMiddleware } from './session.middleware';
export { WristbandExpressSessionModule } from './session.module';

/**
 * Session error class exports
 *
 * ⚠️ WARNING: These are runtime value exports. Importing them will load the
 * @wristband/typescript-session module and trigger Express.Request augmentation.
 *
 * Only import these if you're using the Session Module/Middleware.
 */
export { SessionError, SessionErrorCode } from '@wristband/express-auth';
