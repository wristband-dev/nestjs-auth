import type { SessionOptions } from '@wristband/express-auth';

export interface WristbandSessionAsyncOptions {
  imports?: any[];
  // eslint-disable-next-line no-unused-vars
  useFactory: (...args: any[]) => Promise<SessionOptions> | SessionOptions;
  inject?: any[];
}
