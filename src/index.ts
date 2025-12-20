// express-auth SDK re-exports
export type {
  AuthConfig,
  AuthStrategy,
  CallbackData,
  CallbackResult,
  CallbackResultType,
  LoginConfig,
  LogoutConfig,
  SameSiteOption,
  Session,
  SessionData,
  SessionOptions,
  SessionResponse,
  TokenData,
  TokenResponse,
  UserInfo,
  UserInfoRole,
} from '@wristband/express-auth';
export { WristbandError } from '@wristband/express-auth';

// nestjs-auth SDK exports
export { WristbandExpressAuthModule, WristbandExpressAuthService, createWristbandAuthGuard } from './express';

export type { AuthGuardConfig } from './express';
