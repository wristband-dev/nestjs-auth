import { Controller, Get, Inject, Next, Req, Res } from '@nestjs/common';
import { CallbackResultType } from '@wristband/express-auth';
import { WristbandAuthService } from './auth.service';
import { errorResponse } from './utils/server-utils';
import constants from './constants';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WristbandAuthService)
    private readonly wristbandAuth: WristbandAuthService
  ) {}

  @Get('auth-state')
  async authState(@Req() req, @Res() res): Promise<void> {
    const { session } = req;

    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');

    if (session.isAuthenticated) {
      res.status(200).json({ isAuthenticated: true });
    } else {
      res.status(200).json({ isAuthenticated: false });
    }
  }

  @Get('callback')
  async callback(@Req() req, @Res() res, @Next() next): Promise<void> {
    try {
      const callbackDataResult = await this.wristbandAuth.getCallBack(req, res);
      const { result, callbackData } = callbackDataResult;

      if (result === CallbackResultType.REDIRECT_REQUIRED) {
        // The SDK will have already invoked the redirect() function, so we just stop execution here.
        return;
      }

      req.session.isAuthenticated = true;
      req.session.accessToken = callbackData?.accessToken;
      req.session.expiresAt = Date.now() + (callbackData?.expiresIn ?? 0) * 1000;
      req.session.refreshToken = callbackData?.refreshToken;
      req.session.userId = callbackData?.userinfo.sub;
      req.session.tenantId = callbackData?.userinfo.tnt_id;
      req.session.identityProviderName = callbackData?.userinfo.idp_name;
      req.session.tenantDomainName = callbackData?.tenantDomainName;
      req.session.tenantCustomDomain = callbackData?.tenantCustomDomain;

      await req.session.save();
      // Send the user back to the application.
      res.redirect(callbackData?.returnUrl);
    } catch (error) {
      console.error(`(AUTH CALLBACK) Error caused by: `, { error });
      next(errorResponse(500, constants.errors.UNEXPECTED_ERROR));
    }
  }

  @Get('login')
  async login(@Req() req, @Res() res): Promise<void> {
    return await this.wristbandAuth.getLogin(req, res);
  }

  @Get('logout')
  async logout(@Req() req, @Res() res, @Next() next): Promise<void> {
    const { session } = req;
    const { refreshToken, tenantDomainName } = session;

    if (Object.keys(this.wristbandAuth.SESSION_COOKIES_CONFIG).length > 0) {
      if (this.wristbandAuth.SESSION_COOKIES_CONFIG.sessionCookieName)
        res.clearCookie(this.wristbandAuth.SESSION_COOKIES_CONFIG.sessionCookieName);
      if (this.wristbandAuth.SESSION_COOKIES_CONFIG.csrfCookieName)
        res.clearCookie(this.wristbandAuth.SESSION_COOKIES_CONFIG.csrfCookieName);
    }

    session.destroy();

    try {
      await this.wristbandAuth.getLogout(req, res, { refreshToken, tenantDomainName });
    } catch (error) {
      console.error(`Revoking token during logout failed due ${error}`);
      next(error);
    }
  }

  @Get('signup')
  async signup(@Res() res): Promise<void> {
    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');
    return await res.redirect(this.wristbandAuth.getSignupUrl());
  }

  @Get('session-data')
  async sessionData(@Req() req, @Res() res): Promise<void> {
    const { session } = req;
    try {
      if (session.isAuthenticated) {
        res.status(200).json({
          isAuthenticated: true,
          userId: session.userId,
          tenantId: session.tenantId,
          identityProviderName: session.identityProviderName,
          tenantDomainName: session.tenantDomainName,
        });
      } else {
        res.status(200).json({ isAuthenticated: false });
      }
    } catch (error) {
      console.error(`Error getting session data: ${error}`);
    }
  }
}
