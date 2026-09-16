// typescript-auth / typescript-session re-exports
export type {
  AuthConfig,
  AuthStrategy,
  CallbackData,
  CallbackResult,
  CallbackResultType,
  LoginConfig,
  LogoutConfig,
  TokenData,
  UserInfo,
  UserInfoRole,
} from '@wristband/typescript-auth';
export { WristbandError } from '@wristband/typescript-auth';

export type {
  SameSiteOption,
  Session,
  SessionData,
  SessionOptions,
  SessionResponse,
  TokenResponse,
} from '@wristband/typescript-session';

// nestjs-auth SDK exports
export { WristbandExpressAuthModule, WristbandExpressAuthService, createWristbandAuthGuard } from './express';

export type { AuthGuardConfig } from './express';
