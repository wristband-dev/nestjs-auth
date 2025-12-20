import { AuthConfig } from '@wristband/express-auth';

export interface WristbandAuthAsyncOptions {
  imports?: any[];
  // eslint-disable-next-line no-unused-vars
  useFactory: (..._args: any[]) => Promise<AuthConfig> | AuthConfig;
  inject?: any[];
}
