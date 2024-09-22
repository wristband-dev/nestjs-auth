import { Test, TestingModule } from '@nestjs/testing';

import type { AuthConfig } from '../../types';
import { WristbandExpressAuthModule } from '../../express/express-auth.module';
import { WristbandExpressAuthService } from '../../express/express-auth.service';

describe('WristbandExpressAuthModule', () => {
  let module: TestingModule;
  let config: AuthConfig;

  beforeEach(async () => {
    config = {
      clientId: 'soibgmqekjhsjpk3crzd5ohjni',
      clientSecret: 'b03b7e19b927384e10f71ada872aae09',
      loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
      loginUrl: 'http://localhost:3002',
      redirectUri: 'http://localhost:3002',
      wristbandApplicationDomain: 'http://localhost:3002',
    } as AuthConfig;

    module = await Test.createTestingModule({
      imports: [WristbandExpressAuthModule.forRoot(config)],
    }).compile();
  });

  it('should create a dynamic module with the correct configuration', () => {
    const dynamicModule = WristbandExpressAuthModule.forRoot(config);
    expect(dynamicModule.module).toBe(WristbandExpressAuthModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provide: WristbandExpressAuthService,
          useValue: expect.any(WristbandExpressAuthService),
        }),
      ])
    );
  });

  it('should provide WristbandExpressAuthService with the correct configuration', () => {
    const wristbandAuthService = module.get<WristbandExpressAuthService>(WristbandExpressAuthService);
    expect(wristbandAuthService).toBeInstanceOf(WristbandExpressAuthService);
  });
});
