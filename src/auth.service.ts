import { Injectable } from '@nestjs/common';
import { createWristbandAuth } from '@wristband/express-auth';
import AUTH_MESSAGES from './constants';
import { setRoutesForMiddleware, SetRoutesForMiddleware } from './utils/routes-utils';
import type { AuthConfig, LogoutConfig, WristbandAuth } from '@wristband/express-auth';

const { CONFIGURATION_ERROR } = AUTH_MESSAGES.errors;

type SessionCookiesConfig = {
  sessionCookieName?: string;
  sessionCookieSecret?: string;
  csrfCookieName?: string;
  csrfCookieSecret?: string;
};

type OptionalConfigs = {
  signupUrl?: string;
};


export type AuthServiceConfig = AuthConfig & SessionCookiesConfig & OptionalConfigs;

@Injectable()
export class WristbandAuthService {
    private wristbandAuth: WristbandAuth;
    public readonly SESSION_COOKIES_CONFIG: SessionCookiesConfig;
  constructor(
    private config: AuthServiceConfig,
  ) {
    this.wristbandAuth = this.createAuth(this.config);
    this.SESSION_COOKIES_CONFIG = {
      sessionCookieName: this.config.sessionCookieName,
      csrfCookieName: this.config.csrfCookieName,
    };
  }

  // private getConfigValue(key: string, errorMessage: string): string | undefined {
  //   try {
  //     return .prototype.get<string>(key);
  //   } catch (error) {
  //     console.error(errorMessage);
  //     return undefined;
  //   }
  // }

  public createAuth(config: AuthConfig) {
    try {
      if (config && Object.keys(config).length > 0) this.wristbandAuth = createWristbandAuth(config);
    } catch (error) {
      console.error(CONFIGURATION_ERROR);
      throw new Error(CONFIGURATION_ERROR);
    }
    return this.wristbandAuth;
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

  public getSignupUrl() {
    return this.config.signupUrl || '';
  }

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
  // public getAuthRoutes(routes?: SetRoutesForMiddleware): string[] {
  //   try {
  //     if (!routes) {
  //       const routeList = this.getConfigValue(
  //         'WBAUTH__MIDDLEWARE_ROUTES',
  //         'WBAUTH__MIDDLEWARE_ROUTES not found. Routes will not be protected.'
  //       );
  //       return setRoutesForMiddleware(routeList);
  //     }

  //     return setRoutesForMiddleware(routes);
  //   } catch (error) {
  //     console.error('Error getting Wristband Auth Middleware Routes. Routes will not be protected.');
  //     return [];
  //   }
  // }
}
