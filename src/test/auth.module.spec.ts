import { Test, TestingModule } from '@nestjs/testing';
import { WristbandModule } from '../auth.module';
import { AuthServiceConfig, WristbandAuthService } from '../auth.service';

describe('WristbandModule', () => {
  let module: TestingModule;
  let config: AuthServiceConfig;

  beforeEach(async () => {
    config = {
      clientId: 'soibgmqekjhsjpk3crzd5ohjni',
      clientSecret: 'b03b7e19b927384e10f71ada872aae09',
      loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
      loginUrl: 'http://localhost:3002',
      redirectUri: 'http://localhost:3002',
      wristbandApplicationDomain: 'http://localhost:3002',
    } as AuthServiceConfig;

    module = await Test.createTestingModule({
      imports: [WristbandModule.forRoot(config)],
    }).compile();
  });

  it('should create a dynamic module with the correct configuration', () => {
    const dynamicModule = WristbandModule.forRoot(config);
    expect(dynamicModule.module).toBe(WristbandModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        provide: WristbandAuthService,
        useValue: expect.any(WristbandAuthService),
      }),
    ]));
  });

  it('should provide WristbandAuthService with the correct configuration', () => {
    const wristbandAuthService = module.get<WristbandAuthService>(WristbandAuthService);
    expect(wristbandAuthService).toBeInstanceOf(WristbandAuthService);
  });
});