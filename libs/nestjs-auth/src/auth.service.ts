import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig, createWristbandAuth, WristbandAuth } from '@wristband/express-auth';
import { SetRoutesForMiddleware, setRoutesForMiddleware } from './utils/routes-utils';

@Injectable()
export class WristbandAuthService {
  constructor(private configService: ConfigService) {}

  private getConfigValue(key: string, errorMessage: string): string | undefined {
    try {
      return this.configService.get<string>(key);
    } catch (error) {
      console.error(errorMessage);
      return undefined;
    }
  }
  /* Wristband Specific Configurations */
  public getFrontendDomain() {
    return this.getConfigValue('FRONTEND_DOMAIN', 'FRONTEND_DOMAIN not found.');
  }

  public getClientId() {
    return this.getConfigValue('CLIENT_ID', 'CLIENT_ID not found.');
  }

  public getClientSecret() {
    return this.getConfigValue('CLIENT_SECRET', 'CLIENT_SECRET not found.');
  }

  public getCsrfTokenCookieName() {
    return this.getConfigValue('CSRF_TOKEN_COOKIE_NAME', 'CSRF_TOKEN_COOKIE_NAME not found.');
  }

  public getCallbackUrl() {
    return this.getConfigValue('CALLBACK_URL', 'CALLBACK_URL not found.');
  }

  public getDomainFormat() {
    return this.getConfigValue('DOMAIN_FORMAT', 'DOMAIN_FORMAT not found.');
  }

  public getLoginUrl() {
    return this.getConfigValue('LOGIN_URL', 'LOGIN_URL not found.');
  }

  public getLoginStateCookieSecret() {
    return this.getConfigValue('LOGIN_STATE_COOKIE_SECRET', 'LOGIN_STATE_COOKIE_SECRET not found.');
  }

  public getSessionCookieName() {
    return this.getConfigValue('SESSION_COOKIE_NAME', 'SESSION_COOKIE_NAME not found.');
  }

  public getSessionCookieSecret() {
    return this.getConfigValue('SESSION_COOKIE_SECRET', 'SESSION_COOKIE_SECRET not found.');
  }

  public getSessionCookieMaxAge() {
    return this.getConfigValue('SESSION_COOKIE_MAX_AGE', 'SESSION_COOKIE_MAX_AGE not found.') as unknown as number;
  }
  // This sets the dangerouslyDisableSecureCookies property in the wristband auth configuration
  public getSecureCookiesEnabled() {
    return this.getConfigValue('SECURE_COOKIES_ENABLED', 'SECURE_COOKIES_ENABLED not found.') === 'true';
  }

  public getSignupUrl() {
    return this.getConfigValue('SIGNUP_URL', 'SIGNUP_URL not found.');
  }

  public getTenantLoginUrl() {
    return this.getConfigValue('TENANT_LOGIN_URL', 'TENANT_LOGIN_URL not found.');
  }

  public getUseCustomDomains() {
    return this.getConfigValue('USE_CUSTOM_DOMAINS', 'USE_CUSTOM_DOMAINS is not found.') === 'true';
  }

  public getUseTenantSubdomains() {
    return this.getConfigValue('USE_TENANT_SUBDOMAINS', 'USE_TENANT_SUBDOMAINS is not found.') === 'true';
  }

  public getUserAgentUrlProtocol() {
    return this.getConfigValue('USER_AGENT_URL_PROTOCOL', 'USER_AGENT_URL_PROTOCOL not found.');
  }

  public getWristbandApplicationDomain() {
    return this.getConfigValue('WRISTBAND_APPLICATION_DOMAIN', 'WRISTBAND_APPLICATION_DOMAIN not found.');
  }
  /* End Wristband Specific Configurations */

  /* Node Specific Configurations if needed for local development */
  public getPort() {
    return this.getConfigValue('PORT', 'PORT not found. Using default application port.');
  }

  public getNodeEnv() {
    return this.getConfigValue('NODE_ENV', 'NODE_ENV not found. Using development environment.');
  }
  /* End Node Specific Configurations */

  /* Get Router Configurations */
  /**
   * Optional routes to be protected by wristband auth middleware
   * @param routes optional string as comma separated values is parsed
   * into an array OR passed as an array without modification
   * @optional use of environment variable WRISTBAND_AUTH_MIDDLEWARE_ROUTES
   * to set the routes using a string of comma separated values
   * @returns array of routes to be protected by wristband auth middleware
   */
  public getWristbandAuthRoutes(routes?: SetRoutesForMiddleware): string[] {
    try {
      if (!routes) {
        const routeList = this.getConfigValue(
          'WRISTBAND_AUTH_MIDDLEWARE_ROUTES',
          'WRISTBAND_AUTH_MIDDLEWARE_ROUTES not found. Routes will not be protected.'
        );
        return setRoutesForMiddleware(routeList);
      }

      return setRoutesForMiddleware(routes);
    } catch (error) {
      console.error('Error getting Wristband Auth Middleware Routes. Routes will not be protected.');
      return [];
    }
  }

  /**
   * Optional routes to be protected by wristband auth middleware
   * @param routes optional string as comma separated values is parsed
   * into an array OR passed as an array without modification
   * @optional use of environment variable WRISTBAND_AUTH_MIDDLEWARE_ROUTES
   * to set the routes using a string of comma separated values
   * @returns array of routes to be protected by wristband auth middleware
   */
  public getCsrfMiddlewareRoutes(routes?: SetRoutesForMiddleware): string[] {
    try {
      if (!routes) {
        const routeList = this.getConfigValue(
          'WRISTBAND_CSRF_MIDDLEWARE_ROUTES',
          'WRISTBAND_CSRF_MIDDLEWARE_ROUTES not found. Routes will not be protected.'
        );
        return setRoutesForMiddleware(routeList);
      }

      return setRoutesForMiddleware(routes);
    } catch (error) {
      console.error('Error getting CSRF Middleware Routes. Routes will not be protected.');
      return [];
    }
  }

  /* 
  * @param config optional configuration object to be passed to createWristbandAuth
  * @returns WristbandAuth instance
  */
  public getWristbandAuth(config?: AuthConfig): WristbandAuth {
    if (!config) {
      return createWristbandAuth({
        clientId: this.getClientId() ?? '',
        clientSecret: this.getClientSecret() ?? '',
        dangerouslyDisableSecureCookies: this.getSecureCookiesEnabled(),
        loginStateSecret: this.getLoginStateCookieSecret() ?? '',
        loginUrl: this.getLoginUrl() ?? '',
        redirectUri: this.getCallbackUrl() ?? '',
        rootDomain: this.getFrontendDomain(),
        useCustomDomains: this.getUseCustomDomains(),
        useTenantSubdomains: this.getUseTenantSubdomains(),
        wristbandApplicationDomain: this.getWristbandApplicationDomain() ?? '',
      });
    }
    return createWristbandAuth(config);
  }

  public getRefreshTokenIfExpired(refreshToken: string, expiresAt: number) {
    return this.getWristbandAuth().refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
