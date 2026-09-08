import { Module, DynamicModule } from '@nestjs/common';
import type { AuthConfig } from '@wristband/typescript-auth';

import { WristbandExpressAuthService } from './auth.service';
import { DEFAULT_AUTH_TOKEN } from '../constants';
import { WristbandAuthAsyncOptions } from '../types/auth.types';

/**
 * The WristbandExpressAuthModule is a dynamic NestJS module that integrates the Wristband Authentication Service
 * for NestJS/Express-based applications.
 */
@Module({})
export class WristbandExpressAuthModule {
  static forRootAsync(options: WristbandAuthAsyncOptions, token: string = DEFAULT_AUTH_TOKEN): DynamicModule {
    const configToken = `${token}_CONFIG`;

    return {
      module: WristbandExpressAuthModule,
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: configToken,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: token,
          useFactory: (config: AuthConfig) => {
            return new WristbandExpressAuthService(config);
          },
          inject: [configToken],
        },
      ],
      exports: [token],
    };
  }
}
