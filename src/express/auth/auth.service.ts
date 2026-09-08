import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createWristbandAuth } from '@wristband/typescript-auth';
import type {
  AuthConfig,
  CallbackResult,
  LoginConfig,
  LogoutConfig,
  TokenData,
  WristbandAuth,
} from '@wristband/typescript-auth';

/**
 * The WristbandExpressAuthService provides methods to interact with Wristband for NestJS-based applications.
 * It integrates with the Wristband typescript-auth SDK to manage authentication flows, including login, logout,
 * callback handling, and token refreshing.
 *
 * This service is designed to be injected as a global service via importing the WristbandExpressAuthModule.
 */
@Injectable()
export class WristbandExpressAuthService {
  public wristbandAuth: WristbandAuth;

  constructor(config: AuthConfig) {
    this.wristbandAuth = this.createWristbandAuth(config);
  }

  private createWristbandAuth(config: AuthConfig): WristbandAuth {
    if (!config || Object.keys(config).length === 0) {
      throw new Error('Please provide an auth configuration object for the Wristband SDK.');
    }

    try {
      return createWristbandAuth({ ...config });
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }
  }

  /**
   * Initiates a login request by redirecting to Wristband.
   */
  public login(req: Request, res: Response, loginConfig?: LoginConfig): Promise<string> {
    return loginConfig ? this.wristbandAuth.login(req, res, loginConfig) : this.wristbandAuth.login(req, res);
  }

  /**
   * Receives incoming requests from Wristband with an authorization code.
   */
  public callback(req: Request, res: Response): Promise<CallbackResult> {
    return this.wristbandAuth.callback(req, res);
  }

  /**
   * Revokes the user's refresh token and returns a redirect URL to Wristband's Logout Endpoint.
   */
  public logout(req: Request, res: Response, logoutConfig?: LogoutConfig): Promise<string> {
    return logoutConfig ? this.wristbandAuth.logout(req, res, logoutConfig) : this.wristbandAuth.logout(req, res);
  }

  /**
   * Checks if the user's access token is expired and refreshes the token, if necessary.
   */
  public refreshTokenIfExpired(refreshToken: string, expiresAt: number): Promise<TokenData | null> {
    return this.wristbandAuth.refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
