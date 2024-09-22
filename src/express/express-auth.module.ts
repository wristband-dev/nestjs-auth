import { Module, DynamicModule } from '@nestjs/common';

import { WristbandExpressAuthService } from './express-auth.service';
import { AuthConfig } from '../types';

@Module({
  imports: [],
  controllers: [],
  providers: [WristbandExpressAuthService],
  exports: [WristbandExpressAuthService],
})
export class WristbandExpressAuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    return {
      module: WristbandExpressAuthModule,
      global: true,
      providers: [{ provide: WristbandExpressAuthService, useValue: new WristbandExpressAuthService(config) }],
    };
  }
}
