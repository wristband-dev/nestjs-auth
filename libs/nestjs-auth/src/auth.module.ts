import { MiddlewareConsumer, Module, NestModule, Inject } from '@nestjs/common';
import { WristbandAuthService } from './auth.service';
import { SessionService } from './utils/session.service';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { WristbandAuthMiddleware } from './middleware/wristband-auth.middleware';

@Module({
  imports: [],
  providers: [WristbandAuthService, SessionService],
  exports: [WristbandAuthService],
})
export class WristbandModule implements NestModule {
  constructor(
    @Inject(WristbandAuthService)
    private readonly wristbandAuth: WristbandAuthService
  ) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WristbandAuthMiddleware).forRoutes(...this.wristbandAuth.getWristbandAuthRoutes());
    consumer.apply(CsrfMiddleware).forRoutes(...this.wristbandAuth.getCsrfMiddlewareRoutes());
  }
}
