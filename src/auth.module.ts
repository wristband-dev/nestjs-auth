import { Module, DynamicModule } from '@nestjs/common';
import { AuthServiceConfig, WristbandAuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [],
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
}
