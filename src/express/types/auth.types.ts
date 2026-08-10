import { AuthConfig } from '@wristband/express-auth';

export interface WristbandAuthAsyncOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (..._args: any[]) => Promise<AuthConfig> | AuthConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}
