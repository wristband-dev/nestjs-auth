import { Module, DynamicModule } from '@nestjs/common';

import { WristbandExpressSessionMiddleware } from './session.middleware';
import { SESSION_OPTIONS_TOKEN } from '../constants';
import { WristbandSessionAsyncOptions } from '../types/session.types';

/**
 * The WristbandExpressSessionModule is a dynamic NestJS module that provides session management
 * for NestJS/Express-based applications using Wristband's secure session handling.
 *
 * This module configures and provides the `WristbandExpressSessionMiddleware`, which handles:
 * - Encrypted session cookie creation and management
 * - Session lifecycle (creation, updates, destruction)
 * - Optional CSRF protection
 * - Automatic session persistence
 *
 * The module is designed to be globally available, ensuring session functionality is accessible
 * across all routes in your application.
 *
 * NOTE: Importing session-related components from '@wristband/nestjs-auth/session' automatically
 * augments `Express.Request` with the `session` property for type safety.
 *
 * @remarks
 * This module should typically be imported once in your root AppModule and applied globally
 * via middleware configuration.
 *
 * @example
 * ```typescript
 * // Import and configure in AppModule
 * import { Module } from '@nestjs/common';
 * import { ConfigModule, ConfigService } from '@nestjs/config';
 * import { WristbandExpressSessionModule } from '@wristband/nestjs-auth/session';
 *
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot(),
 *     WristbandExpressSessionModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (configService: ConfigService) => ({
 *         secrets: configService.get('SESSION_SECRET'),
 *         secure: true,
 *         enableCsrfProtection: true,
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(WristbandExpressSessionMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Static configuration (not recommended for production)
 * WristbandExpressSessionModule.forRootAsync({
 *   useFactory: () => ({
 *     secrets: 'your-session-secret',
 *     secure: false, // Only for development
 *     enableCsrfProtection: true,
 *   }),
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Access session in controllers
 * import '@wristband/nestjs-auth/session'; // Enable req.session typing
 * import { Controller, Get, Req } from '@nestjs/common';
 * import { Request } from 'express';
 *
 * @Controller('api')
 * export class UserController {
 *   @Get('profile')
 *   getProfile(@Req() req: Request) {
 *     const { userId, tenantId } = req.session;
 *     return { userId, tenantId };
 *   }
 * }
 * ```
 */
@Module({})
export class WristbandExpressSessionModule {
  /**
   * Configures and initializes the WristbandExpressSessionModule with async configuration.
   *
   * This method allows you to configure session options asynchronously, typically by injecting
   * other services like ConfigService to read configuration from environment variables or
   * configuration files.
   *
   * The module is registered globally, making the session middleware and configuration available
   * throughout your application without needing to import it in every module.
   *
   * @param options - Async configuration options including useFactory, inject, and imports
   * @param options.useFactory - Factory function that returns SessionOptions (sync or async)
   * @param options.inject - Optional array of dependencies to inject into the factory function
   * @param options.imports - Optional array of modules to import (e.g., ConfigModule)
   * @returns A NestJS DynamicModule that provides and exports the session middleware and configuration
   *
   * @example
   * ```typescript
   * WristbandExpressSessionModule.forRootAsync({
   *   imports: [ConfigModule],
   *   useFactory: async (configService: ConfigService) => ({
   *     secrets: configService.get('SESSION_SECRET'),
   *     cookieName: 'my-session',
   *     secure: configService.get('NODE_ENV') === 'production',
   *     enableCsrfProtection: true,
   *   }),
   *   inject: [ConfigService],
   * });
   * ```
   */
  static forRootAsync(options: WristbandSessionAsyncOptions): DynamicModule {
    return {
      module: WristbandExpressSessionModule,
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: SESSION_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        WristbandExpressSessionMiddleware,
      ],
      exports: [SESSION_OPTIONS_TOKEN, WristbandExpressSessionMiddleware],
    };
  }
}
