import { Request, Response, NextFunction } from 'express';
import { getSessionSync, Session, SessionData, SessionOptions } from '@wristband/typescript-session';

/**
 * Augments the Express Request interface to include a session property.
 */
declare module 'express-serve-static-core' {
  interface Request {
    /** Session instance with management methods and typed data access */
    session: Session<SessionData> & SessionData;
  }
}

/**
 * Executes a callback immediately before response headers are written.
 *
 * @internal
 */
function onHeaders(res: Response, listener: () => void): void {
  const prevWriteHead = res.writeHead.bind(res);

  res.writeHead = function (...args: Parameters<typeof res.writeHead>): Response {
    if (!res.headersSent) {
      try {
        listener.call(res);
      } catch {
        // Silent failure - if this throws, the environment is usually fundamentally broken
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res.writeHead as any) = prevWriteHead;
    return prevWriteHead(...args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

/**
 * Create Wristband session middleware for Express (used by Nest session middleware).
 *
 * @internal
 */
export function createWristbandSession(options: SessionOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session = getSessionSync(req, res, options);
      req.session.enableDeferredMode();

      onHeaders(res, () => {
        if (!res.headersSent) {
          try {
            req.session.flushSync();
          } catch {
            // Silent failure - if this throws, the environment is usually fundamentally broken
          }
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
