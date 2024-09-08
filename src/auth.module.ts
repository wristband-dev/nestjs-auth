import { MiddlewareConsumer, Module, DynamicModule } from '@nestjs/common';
import { AuthServiceConfig, WristbandAuthService } from './auth.service';
import { WristbandAuthMiddleware } from './middleware/wristband-auth.middleware';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [WristbandAuthService],
  exports: [WristbandAuthService],
})
export class WristbandModule {

  static forRoot(config: AuthServiceConfig): DynamicModule {
    return {
      module: WristbandModule,
      global: true,
      providers: [{ provide: WristbandAuthService, useValue: new WristbandAuthService(config) }],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WristbandAuthMiddleware).forRoutes('/api/v1/auth/session-data');
  }
}
