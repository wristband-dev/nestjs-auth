import { Injectable } from '@nestjs/common';
import { createWristbandAuth as makeWristbandAuth } from '@wristband/express-auth';
import type { AuthConfig, LogoutConfig, WristbandAuth } from '@wristband/express-auth';

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
    public wristbandAuth: WristbandAuth;
  constructor(
    private config: AuthServiceConfig,
  ) {
    this.wristbandAuth = this.createWristbandAuth(this.config);
  }

  public createWristbandAuth(config: AuthConfig) {
    try {
      if (config && Object.keys(config).length > 0) this.wristbandAuth = makeWristbandAuth(config);
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
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
