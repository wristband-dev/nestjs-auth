import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createWristbandAuth as createExpressWristbandAuth } from '@wristband/express-auth';
import type {
  AuthConfig,
  CallbackResult,
  LoginConfig,
  LogoutConfig,
  TokenData,
  WristbandAuth,
} from '@wristband/express-auth';

/**
 * The WristbandExpressAuthService provides methods to interact with Wristband for NestJS-based applications.
 * It integrates with the Wristband express-auth SDK to manage authentication flows, including login, logout,
 * callback handling, and token refreshing. The service uses an instance of the Wristband express-auth SDK to
 * facilitate authentication.
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
      return createExpressWristbandAuth({ ...config });
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }
  }

  /**
   * Initiates a login request by redirecting to Wristband. An authorization request is constructed
   * for the user attempting to login in order to start the Authorization Code flow.
   *
   * Your Express request can contain Wristband-specific query parameters:
   * - login_hint: A hint to Wristband about user's preferred login identifier. This can be appended as a query
   * parameter in the redirect request to the Authorize URL.
   * - return_url: The location of where to send users after authenticating.
   * - tenant_custom_domain: The tenant custom domain for the tenant that the user belongs to, if applicable. Should be
   * used as the domain of the authorize URL when present.
   * - tenant_name: The name of the tenant the user belongs to. Should be used in the tenant vanity domain of
   * the authorize URL when not utilizing tenant subdomains nor tenant custom domains.
   *
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @param {LoginConfig} [config] Additional configuration for creating an auth request to Wristband.
   * @returns {Promise<string>} A Promise containing a redirect URL to Wristband's Authorize Endpoint.
   * @throws {Error} If an error occurs during the login process.
   */
  public login(req: Request, res: Response, loginConfig?: LoginConfig): Promise<string> {
    return loginConfig ? this.wristbandAuth.login(req, res, loginConfig) : this.wristbandAuth.login(req, res);
  }

  /**
   * Receives incoming requests from Wristband with an authorization code. It will then proceed to exchange the auth
   * code for an access token as well as fetch the userinfo for the user attempting to login.
   *
   * Your Express request can contain Wristband-specific query parameters:
   * - code: The authorization code to use for exchanging for an access token.
   * - error: An error code indicating that some an issue occurred during the login process.
   * - error_description: A plaintext description giving more detail around the issue that occurred during the login
   * process.
   * - state: The state value that was originally sent to the Authorize URL.
   * - tenant_custom_domain: If the tenant has a tenant custom domain defined, then this query parameter will be part
   * of the incoming request to the Callback Endpoint. In the event a redirect to the Login Endpoint is required, then
   * this should be appended as a query parameter when redirecting to the Login Endpoint.
   * - tenant_name: The name of the tenant the user belongs to. In the event a redirect to the Login Endpoint
   * is required and neither tenant subdomains nor tenant custom domains are not being utilized, then this should be
   * appended as a query parameter when redirecting to the Login Endpoint.
   *
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @returns {Promise<CallbackResult>} A Promise containing the result of what happened during callback execution
   * as well as any accompanying data.
   * @throws {Error} If an error occurs during the callback handling.
   */
  public callback(req: Request, res: Response): Promise<CallbackResult> {
    return this.wristbandAuth.callback(req, res);
  }

  /**
   * Revokes the user's refresh token and redirects them to the Wristband logout endpoint to destroy
   * their authenticated session in Wristband.
   *
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @param {LogoutConfig} [config] Additional configuration for logging out the user.
   * @returns {Promise<string>} A Promise of type string containing a redirect URL to Wristband's Logout Endpoint.
   * @throws {Error} If an error occurs during the logout process.
   */
  public logout(req: Request, res: Response, logoutConfig?: LogoutConfig): Promise<string> {
    return logoutConfig ? this.wristbandAuth.logout(req, res, logoutConfig) : this.wristbandAuth.logout(req, res);
  }

  /**
   * Checks if the user's access token is expired and refreshes the token, if necessary.
   *
   * @param {string} refreshToken The refresh token.
   * @param {number} expiresAt Unix timestamp in milliseconds at which the token expires.
   * @returns {Promise<TokenData | null>} A Promise with the data from the token endpoint if the token was refreshed.
   * Otherwise, a Promise with null value is returned.
   * @throws {Error} If an error occurs during the token refresh process.
   */
  public refreshTokenIfExpired(refreshToken: string, expiresAt: number): Promise<TokenData | null> {
    return this.wristbandAuth.refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
