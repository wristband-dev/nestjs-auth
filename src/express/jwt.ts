import type { JWTPayload } from '@wristband/typescript-jwt';

/**
 * JWT type augmentation for Express.
 *
 * Import this module to enable TypeScript support for `req.auth` when using JWT authentication strategy.
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Decoded JWT payload and bearer token.
     */
    auth: JWTPayload & { jwt?: string };
  }
}

export {};
