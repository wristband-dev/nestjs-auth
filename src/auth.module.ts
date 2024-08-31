import { MiddlewareConsumer, Module, NestModule, Inject } from '@nestjs/common';
import { WristbandAuthService } from './auth.service';
import { WristbandAuthMiddleware } from './middleware/wristband-auth.middleware';

@Module({
  imports: [],
  providers: [WristbandAuthService],
  exports: [WristbandAuthService],
})
export class WristbandModule implements NestModule {
  constructor(
    @Inject(WristbandAuthService)
    private readonly wristbandAuth: WristbandAuthService
  ) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WristbandAuthMiddleware).forRoutes(...this.wristbandAuth.getAuthRoutes());
  }
}
