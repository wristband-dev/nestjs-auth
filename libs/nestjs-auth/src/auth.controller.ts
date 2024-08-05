import { Controller, Get, Inject, Next, Req, Res } from '@nestjs/common';
import { WristbandAuthService } from './auth.service';
import { errorResponse } from './utils/server-utils';
import { SessionService } from './utils/session.service';
import constants from './constants';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WristbandAuthService)
    private readonly wristbandAuth: WristbandAuthService,
    @Inject(SessionService)
    private readonly sessionService: SessionService
  ) {}

  @Get('auth-state')
  async authState(@Req() req, @Res() res): Promise<void> {
    const { session } = req;

    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');

    if (session.isAuthenticated && session.csrfSecret) {
      this.sessionService.updateCsrfTokenAndCookie(req, res, this.wristbandAuth.getCsrfTokenCookieName() as string);
      res.status(200).json({ isAuthenticated: true });
    } else {
      res.status(200).json({ isAuthenticated: false });
    }
  }

  @Get('callback')
  async callback(@Req() req, @Res() res, @Next() next): Promise<void> {
    const frontendDomain = this.wristbandAuth.getFrontendDomain();
    const urlProtocol = this.wristbandAuth.getUserAgentUrlProtocol();
    const cookieName = this.wristbandAuth.getCsrfTokenCookieName() as string;

    try {
      const callbackData = await this.wristbandAuth.getWristbandAuth().callback(req, res);

      if (callbackData) {
        req.session.isAuthenticated = true;
        req.session.accessToken = callbackData.accessToken;
        req.session.expiresAt = this.sessionService.expiresAtWithBuffer(callbackData.expiresIn);
        req.session.refreshToken = callbackData.refreshToken;
        req.session.userId = callbackData.userinfo.sub;
        req.session.tenantId = callbackData.userinfo.tnt_id;
        req.session.identityProviderName = callbackData.userinfo.idp_name;
        req.session.tenantDomainName = callbackData.tenantDomainName;
        req.session.csrfSecret = this.sessionService.createCsrfSecret();

        await req.session.save();

        this.sessionService.updateCsrfTokenAndCookie(req, res, cookieName);
        // Send the user back to the application.
        const tenantDomain =
          this.wristbandAuth.getDomainFormat() === 'VANITY_DOMAIN' ? `${callbackData.tenantDomainName}.` : '';
        // Redirect to the returnUrl if it exists, otherwise redirect to the home page.
        const homePage = `${urlProtocol}://${tenantDomain}${frontendDomain}`;
        res.redirect(callbackData.returnUrl || homePage);
      }
    } catch (error) {
      console.error(`(AUTH CALLBACK) Error caused by: `, { error });
      next(errorResponse(500, constants.errors.UNEXPECTED_ERROR));
    }
  }

  @Get('login')
  async login(@Req() req, @Res() res): Promise<void> {
    return await this.wristbandAuth.getWristbandAuth().login(req, res);
  }

  @Get('logout')
  async logout(@Req() req, @Res() res, @Next() next): Promise<void> {
    const { session } = req;
    const { refreshToken, tenantDomainName } = session;
    res.clearCookie(this.wristbandAuth.getSessionCookieName());
    res.clearCookie(this.wristbandAuth.getCsrfTokenCookieName());
    session.destroy();

    try {
      await this.wristbandAuth.getWristbandAuth().logout(req, res, { refreshToken, tenantDomainName });
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
