import { Injectable } from '@nestjs/common';
import { createWristbandAuth as makeWristbandAuth } from '@wristband/express-auth';
import AUTH_MESSAGES from './constants';
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
    this.wristbandAuth = this.createWristbandAuth(this.config);
    this.SESSION_COOKIES_CONFIG = {
      sessionCookieName: this.config.sessionCookieName,
      csrfCookieName: this.config.csrfCookieName,
    };
  }

  public createWristbandAuth(config: AuthConfig) {
    try {
      if (config && Object.keys(config).length > 0) this.wristbandAuth = makeWristbandAuth(config);
    } catch (error) {
      console.error(CONFIGURATION_ERROR);
      throw new Error(CONFIGURATION_ERROR);
    }
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

  public getRefreshToken(refreshToken: string, expiresAt: number) {
    return this.wristbandAuth.refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
