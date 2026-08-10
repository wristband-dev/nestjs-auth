import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  mixin,
  Type,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { WristbandExpressAuthService } from '../auth/auth.service';
import type { AuthGuardConfig } from '../types/auth-guard.types';
import { DEFAULT_AUTH_TOKEN } from '../constants';

/**
 * Factory function to create a Wristband authentication guard.
 *
 * Creates middleware that validates authentication using configurable strategies (SESSION, JWT, or both).
 * Supports multi-strategy authentication with automatic fallback between strategies.
 *
 * The factory exists to create distinct guard identities for cases where multiple guards with
 * different configurations are needed in the same application.
 *
 * Strategy behavior:
 * - SESSION: Validates session authentication, optionally checks CSRF, and refreshes expired tokens
 * - JWT: Validates JWT bearer tokens from Authorization header
 * - Multi-strategy: Tries strategies in configured order, falls back to next on failure
 *
 * NOTE: Token refresh only occurs when both `refreshToken` and `expiresAt` are present in the session.
 *
 * @param configKey - The ConfigModule key to read guard configuration from (default: 'wristbandAuthGuard')
 * @param authToken - The DI token for the WristbandExpressAuthService (default: DEFAULT_AUTH_TOKEN)
 * @returns A guard class that can be used with @UseGuards()
 *
 * @throws {UnauthorizedException} If all configured strategies fail authentication or token refresh fails
 * @throws {ForbiddenException} If CSRF token validation fails (SESSION strategy only)
 * @throws {InternalServerErrorException} If an unexpected error occurs during authentication
 *
 * @example
 * ```typescript
 * // Default guard (reads from 'wristbandAuthGuard' config)
 * export const WristbandAuthGuard = createWristbandAuthGuard();
 *
 * @Controller('api')
 * export class MyController {
 *   @Get('protected')
 *   @UseGuards(WristbandAuthGuard)
 *   protectedRoute() {
 *     return { message: 'Authenticated' };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Custom guard with different config and service instance
 * export const AdminAuthGuard = createWristbandAuthGuard('adminAuthGuard', 'ADMIN_AUTH_TOKEN');
 *
 * @Controller('admin')
 * export class AdminController {
 *   @Get('dashboard')
 *   @UseGuards(AdminAuthGuard)
 *   adminDashboard() {
 *     return { message: 'Admin access granted' };
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Guard configuration in ConfigModule
 * import { registerAs } from '@nestjs/config';
 * import type { AuthGuardConfig } from '@wristband/nestjs-auth';
 *
 * export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
 *   authStrategies: ['SESSION', 'JWT'],
 *   sessionConfig: {
 *     sessionOptions: {
 *       secrets: process.env.SESSION_SECRET,
 *       enableCsrfProtection: true,
 *     }
 *   }
 * }));
 * ```
 */
export function createWristbandAuthGuard(
  configKey: string = 'wristbandAuthGuard',
  authToken: string = DEFAULT_AUTH_TOKEN
): Type<CanActivate> {
  @Injectable()
  class WristbandAuthGuardMixin implements CanActivate {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly authMiddleware: any;
    private readonly authService: WristbandExpressAuthService;
    private readonly configService: ConfigService;

    constructor(
      @Inject(authToken)
      authService: WristbandExpressAuthService,
      configService: ConfigService
    ) {
      this.authService = authService;
      this.configService = configService;

      // Validate auth service exists
      if (!this.authService) {
        throw new Error(
          `WristbandExpressAuthService not found. Ensure WristbandExpressAuthModule is imported in your module.`
        );
      }

      // Read guard configuration from ConfigService
      const guardConfig = this.configService.get<AuthGuardConfig>(configKey);

      if (!guardConfig) {
        throw new Error(
          `Auth guard configuration not found for key '${configKey}'. ` +
            `Ensure config is registered via ConfigModule.forRoot({ load: [...] })`
        );
      }

      // Validate configuration based on strategies
      this.validateGuardConfig(guardConfig);

      // Create auth middleware with the guard config
      this.authMiddleware = this.authService.wristbandAuth.createAuthMiddleware(guardConfig);
    }

    /**
     * Validates guard configuration based on selected auth strategies.
     */
    private validateGuardConfig(config: AuthGuardConfig): void {
      const { authStrategies, sessionConfig } = config;

      if (!authStrategies || authStrategies.length === 0) {
        throw new Error('Auth guard requires at least one auth strategy');
      }

      // If SESSION strategy is used, validate session configuration
      if (authStrategies.includes('SESSION')) {
        if (!sessionConfig?.sessionOptions) {
          throw new Error('SESSION auth strategy requires sessionConfig.sessionOptions');
        }

        const { secrets } = sessionConfig.sessionOptions;
        if (!secrets || (Array.isArray(secrets) && secrets.length === 0)) {
          throw new Error('SESSION auth strategy requires sessionConfig.sessionOptions.secrets');
        }
      }
    }

    /**
     * Guard implementation that validates authentication using configured strategies.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();

      return new Promise<boolean>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.authMiddleware(request, response, (err?: any) => {
          if (err) {
            // Map Express middleware errors to NestJS exceptions
            const statusCode = err.status || err.statusCode || 500;

            switch (statusCode) {
              case 401:
                reject(new UnauthorizedException(err.message || 'Unauthorized'));
                break;
              case 403:
                reject(new ForbiddenException(err.message || 'Forbidden'));
                break;
              default:
                reject(new InternalServerErrorException(err.message || 'Internal server error'));
            }
          } else {
            resolve(true);
          }
        });
      });
    }
  }

  return mixin(WristbandAuthGuardMixin);
}
