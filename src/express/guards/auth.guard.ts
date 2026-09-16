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
import type { Request } from 'express';

import { WristbandExpressAuthService } from '../auth/auth.service';
import type { AuthGuardConfig } from '../types/auth-guard.types';
import { DEFAULT_AUTH_TOKEN } from '../constants';

/**
 * Factory function to create a Wristband authentication guard.
 *
 * Calls `authenticate()` from `@wristband/typescript-auth` and maps failure reasons to Nest exceptions.
 */
export function createWristbandAuthGuard(
  configKey: string = 'wristbandAuthGuard',
  authToken: string = DEFAULT_AUTH_TOKEN
): Type<CanActivate> {
  @Injectable()
  class WristbandAuthGuardMixin implements CanActivate {
    private readonly guardConfig: AuthGuardConfig;
    private readonly authService: WristbandExpressAuthService;
    private readonly configService: ConfigService;

    constructor(
      @Inject(authToken)
      authService: WristbandExpressAuthService,
      configService: ConfigService
    ) {
      this.authService = authService;
      this.configService = configService;

      if (!this.authService) {
        throw new Error(
          `WristbandExpressAuthService not found. Ensure WristbandExpressAuthModule is imported in your module.`
        );
      }

      const guardConfig = this.configService.get<AuthGuardConfig>(configKey);

      if (!guardConfig) {
        throw new Error(
          `Auth guard configuration not found for key '${configKey}'. ` +
            `Ensure config is registered via ConfigModule.forRoot({ load: [...] })`
        );
      }

      this.validateGuardConfig(guardConfig);
      this.guardConfig = guardConfig;
    }

    private validateGuardConfig(config: AuthGuardConfig): void {
      const { authStrategies, sessionConfig } = config;

      if (!authStrategies || authStrategies.length === 0) {
        throw new Error('Auth guard requires at least one auth strategy');
      }

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

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request as any).auth = {};

      try {
        const result = await this.authService.wristbandAuth.authenticate(request, this.guardConfig, request.session);

        if (!result.authenticated) {
          switch (result.reason) {
            case 'csrf_failed':
              throw new ForbiddenException('Forbidden');
            case 'unexpected_error':
              throw new InternalServerErrorException('Internal server error');
            case 'not_authenticated':
            case 'token_refresh_failed':
            default:
              throw new UnauthorizedException('Unauthorized');
          }
        }

        if (result.usedStrategy === 'JWT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (request as any).auth = { ...result.jwtPayload, jwt: result.jwt };
        }

        return true;
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof ForbiddenException ||
          error instanceof InternalServerErrorException
        ) {
          throw error;
        }

        // Configuration errors from the core SDK (e.g. session_not_configured) surface with their message so
        // that misconfigurations are diagnosable, matching the behavior of previous versions of this guard.
        const message = error instanceof Error && error.message ? error.message : 'Internal server error';
        throw new InternalServerErrorException(message);
      }
    }
  }

  return mixin(WristbandAuthGuardMixin);
}
