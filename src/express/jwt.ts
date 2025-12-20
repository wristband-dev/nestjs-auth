/**
 * JWT Type Augmentation
 *
 * Importing this automatically augments Express.Request with the `auth` property
 * Only needed for import if someone uses AuthGuard with JWT strategy.
 */
import '@wristband/express-auth/jwt';
