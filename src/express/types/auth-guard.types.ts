import type { AuthMiddlewareConfig } from '@wristband/express-auth';

/**
 * Configuration for Wristband authentication guard.
 *
 * This is an alias for `AuthMiddlewareConfig` from @wristband/express-auth.
 * See the express-auth documentation for detailed configuration options.
 *
 * @see {@link https://github.com/wristband-dev/express-auth | @wristband/express-auth documentation}
 */
export type AuthGuardConfig = AuthMiddlewareConfig;
