import { Module, DynamicModule } from '@nestjs/common';

import { WristbandExpressAuthService } from './express-auth.service';
import { AuthConfig } from '../types';

/**
 * The WristbandExpressAuthModule is a dynamic NestJS module that integrates the Wristband Authentication Service
 * for NestJS/Express-based applications. It allows for the configuration and injection of the
 * `WristbandExpressAuthService`, enabling authentication functionality within the application.
 *
 * It offers a flexible setup through its `forRoot` method, allowing configuration of the service with custom
 * `AuthConfig` as well as custom names for service injection, ensuring flexibility when multiple instances are
 * required.
 *
 * Usage:
 * - Call `forRoot` with the desired `AuthConfig` and an optional token name to set up the module.
 * - The module exports the `WristbandExpressAuthService` and any custom token provided, making it available across the app.
 *
 * Example:
 *
 * ```typescript
 * WristbandExpressAuthModule.forRoot({ clientId: 'your-client-id', clientSecret: 'your-client-secret' });
 * ```
 *
 * This module is designed to be globally available, ensuring the `WristbandExpressAuthService` can be easily injected
 * and used across different modules in the application.
 */
@Module({
  imports: [],
  controllers: [],
  providers: [WristbandExpressAuthService],
  exports: [WristbandExpressAuthService],
})
export class WristbandExpressAuthModule {
  static forRoot(config: AuthConfig, token: string = 'wristband'): DynamicModule {
    return {
      module: WristbandExpressAuthModule,
      global: true,
      providers: [
        {
          provide: 'AUTH_CONFIG',
          useValue: config,
        },
        {
          provide: token,
          useClass: WristbandExpressAuthService,
        },
        {
          provide: WristbandExpressAuthService,
          useFactory: (authConfig: AuthConfig) => {
            return new WristbandExpressAuthService(authConfig);
          },
          inject: ['AUTH_CONFIG'],
        },
      ],
      exports: [WristbandExpressAuthService, token],
    };
  }
}
