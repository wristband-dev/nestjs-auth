import { Injectable } from '@nestjs/common';
import { createWristbandAuth as createExpressWristbandAuth } from '@wristband/express-auth';
import type { LogoutConfig, WristbandAuth } from '@wristband/express-auth';
import { Request, Response } from 'express';

import { AuthConfig } from '../types';

@Injectable()
export class WristbandExpressAuthService {
  public wristbandAuth: WristbandAuth;

  constructor(config: AuthConfig) {
    this.wristbandAuth = this.createWristbandAuth(config);
  }

  public createWristbandAuth(config: AuthConfig) {
    if (!config || Object.keys(config).length === 0) {
      throw new Error('Please provide an auth configuration object for the Wristband SDK.');
    }

    try {
      this.wristbandAuth = createExpressWristbandAuth({ ...config });
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }

    return this.wristbandAuth;
  }

  public getLogin(req: Request, res: Response) {
    return this.wristbandAuth.login(req, res);
  }

  public getCallBack(req: Request, res: Response) {
    return this.wristbandAuth.callback(req, res);
  }

  public getLogout(req: Request, res: Response, config: LogoutConfig) {
    return this.wristbandAuth.logout(req, res, config);
  }

  public getRefreshToken(refreshToken: string, expiresAt: number) {
    return this.wristbandAuth.refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
