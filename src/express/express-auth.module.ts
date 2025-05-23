import { Module, DynamicModule } from '@nestjs/common';
import type { AuthConfig } from '@wristband/express-auth';
import { WristbandExpressAuthService } from './express-auth.service';

// Define the async options interface
export interface WristbandAuthAsyncOptions {
  imports?: any[];
  // eslint-disable-next-line no-unused-vars
  useFactory: (..._args: any[]) => Promise<AuthConfig> | AuthConfig;
  inject?: any[];
}

/**
 * The WristbandExpressAuthModule is a dynamic NestJS module that integrates the Wristband Authentication Service
 * for NestJS/Express-based applications. It allows for the configuration and injection of the
 * `WristbandExpressAuthService`, enabling authentication functionality within the application.
 *
 * Usage:
 * - Call `forRootAsync` with configuration options and a token name to set up the module.
 * - The module exports the `WristbandExpressAuthService` with the specified token, making it available across the app.
 *
 * Example:
 *
 * ```typescript
 * import { ConfigModule } from '@nestjs/config';
 * import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';
 *
 * WristbandExpressAuthModule.forRootAsync({
 *   imports: [ConfigModule],
 *   useFactory: (configService: ConfigService) => ({
 *     clientId: configService.get('WRISTBAND_CLIENT_ID'),
 *     clientSecret: configService.get('WRISTBAND_CLIENT_SECRET'),
 *     // ... other config
 *   }),
 *   inject: [ConfigService],
 * }, 'MyWristbandAuth');
 * ```
 *
 * For static configuration:
 *
 * ```typescript
 * import { ConfigModule } from '@nestjs/config';
 * import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';
 *
 * WristbandExpressAuthModule.forRootAsync({
 *   useFactory: () => ({
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
 *     // ... other config
 *   }),
 * }, 'MyWristbandAuth');
 * ```
 *
 * This module is designed to be globally available, ensuring the `WristbandExpressAuthService` can be easily injected
 * and used across different modules in the application. Multiple instances of this SDK can be innjected into the same
 * application, if required.
 */
@Module({})
export class WristbandExpressAuthModule {
  /**
   * Configures and initializes the WristbandExpressAuthModule with async configuration.
   *
   * @param {WristbandAuthAsyncOptions} options - Configuration options including useFactory, inject, and imports
   * @param {string} token - Token name used to identify the service instance. Required for multi-instance support.
   * @returns {DynamicModule} - A NestJS DynamicModule that provides and exports the `WristbandExpressAuthService`
   * with the specified token.
   */
  static forRootAsync(options: WristbandAuthAsyncOptions, token: string): DynamicModule {
    // Create a unique config token for this instance
    const configToken = `${token}_CONFIG`;

    return {
      module: WristbandExpressAuthModule,
      global: true,
      imports: options.imports || [],
      providers: [
        // Provide the config with instance-specific token
        {
          provide: configToken,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        // Provide the service with the custom token
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
