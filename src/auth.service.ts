import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWristbandAuth } from '@wristband/express-auth';
import type {AuthConfig, LogoutConfig, WristbandAuth} from '@wristband/express-auth';
import AUTH_MESSAGES from './constants';
import { setRoutesForMiddleware, SetRoutesForMiddleware } from './utils/routes-utils';

const { CONFIGURATION_ERROR } = AUTH_MESSAGES.errors;

export type SessionConfig = {
  sessionCookieName?: string;
  sessionCookieSecret?: string;
  csrfCookieName?: string;
  csrfCookieSecret?: string;
};
@Injectable()
export class WristbandAuthService {
  constructor(
    private configService: ConfigService,
    public AUTH_CONFIG: AuthConfig,
    public SESSION_COOKIES_CONFIG: SessionConfig,
    public wristbandAuth: WristbandAuth,
    public SIGNUP_URL: string
  ) {
    this.AUTH_CONFIG;
    this.SESSION_COOKIES_CONFIG;
    this.wristbandAuth;
    this.SIGNUP_URL;
  }

  private getConfigValue(key: string, errorMessage: string): string | undefined {
    try {
      return this.configService.get<string>(key);
    } catch (error) {
      console.error(errorMessage);
      return undefined;
    }
  }

  public createAuth(AUTH_CONFIG: AuthConfig) {
    try {
      if (AUTH_CONFIG) this.AUTH_CONFIG = AUTH_CONFIG;
      this.wristbandAuth = createWristbandAuth(AUTH_CONFIG);
    } catch (error) {
      console.error(CONFIGURATION_ERROR);
      throw new Error(CONFIGURATION_ERROR);
    }
    return this.wristbandAuth;
  }

  public setSessionConfig(config) {
    if (config) this.SESSION_COOKIES_CONFIG = config;
  }

  public getAuth() {
    return this.wristbandAuth;
  }

  public getLogin(req, res) {
    return this.wristbandAuth.login(req, res);
  }

  public getCallBack(req, res) {
    return this.wristbandAuth.callback(req, res);
  }

  public getLogout(req, res, config: LogoutConfig) {
    return this.wristbandAuth.logout(req, res, config);
  }

  public setSignupUrl(url: string = '') {
    this.SIGNUP_URL = url;
  }

  public getSignupUrl() {
    return this.SIGNUP_URL;
  }

  // public getLogin(@Req() req, @Res() res, config?: LoginConfig) {
  //   return wristbandAuth.login;
  // }

  // public getLogout(@Req() req, @Res() res, config?: LogoutConfig) {
  //   return wristbandAuth.logout;
  // }

  public getRefreshToken(refreshToken: string, expiresAt: number) {
    return this.wristbandAuth.refreshTokenIfExpired(refreshToken, expiresAt);
  }

  // /* Get Router Configurations */
  // /**
  //  * Optional routes to be protected by wristband auth middleware
  //  * @param routes optional string as comma separated values is parsed
  //  * into an array OR passed as an array without modification
  //  * @optional use of environment variable WRISTBAND_AUTH_MIDDLEWARE_ROUTES
  //  * to set the routes using a string of comma separated values
  //  * @returns array of routes to be protected by wristband auth middleware
  //  */
  public getAuthRoutes(routes?: SetRoutesForMiddleware): string[] {
    try {
      if (!routes) {
        const routeList = this.getConfigValue(
          'WBAUTH__MIDDLEWARE_ROUTES',
          'WBAUTH__MIDDLEWARE_ROUTES not found. Routes will not be protected.'
        );
        return setRoutesForMiddleware(routeList);
      }

      return setRoutesForMiddleware(routes);
    } catch (error) {
      console.error('Error getting Wristband Auth Middleware Routes. Routes will not be protected.');
      return [];
    }
  }
}
