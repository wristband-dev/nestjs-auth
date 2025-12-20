import { Test, TestingModule } from '@nestjs/testing';

import type { AuthConfig } from '../../../src';
import { WristbandExpressAuthModule, WristbandExpressAuthService } from '../../../src';
import { DEFAULT_AUTH_TOKEN } from '../../../src/express/constants';

describe('WristbandExpressAuthModule', () => {
  let module: TestingModule;
  let firstAuthService: WristbandExpressAuthService;
  let secondAuthService: WristbandExpressAuthService;
  let thirdAuthService: WristbandExpressAuthService;
  let config: AuthConfig;

  beforeEach(async () => {
    config = {
      clientId: 'soibgmqekjhsjpk3crzd5ohjni',
      clientSecret: 'b03b7e19b927384e10f71ada872aae09',
      loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
      loginUrl: 'http://localhost:3002',
      redirectUri: 'http://localhost:3002',
      wristbandApplicationVanityDomain: 'http://localhost:3002',
    } as AuthConfig;

    module = await Test.createTestingModule({
      imports: [
        WristbandExpressAuthModule.forRootAsync({
          useFactory: () => config,
        }, 'firstWristband'),
        WristbandExpressAuthModule.forRootAsync({
          useFactory: () => ({ ...config, clientId: 'different-client-id' }),
        }, 'secondWristband'),
        WristbandExpressAuthModule.forRootAsync({
          useFactory: () => ({ ...config, clientId: 'third-client-id' }),
        }, 'thirdWristband'),
      ],
    }).compile();

    firstAuthService = module.get<WristbandExpressAuthService>('firstWristband');
    secondAuthService = module.get<WristbandExpressAuthService>('secondWristband');
    thirdAuthService = module.get<WristbandExpressAuthService>('thirdWristband');
  });

  afterEach(async () => {
    await module.close();
  });

  it('should create three instances of WristbandExpressAuthService with different tokens', () => {
    expect(firstAuthService).toBeDefined();
    expect(secondAuthService).toBeDefined();
    expect(thirdAuthService).toBeDefined();

    // Check that the services are different instances
    expect(firstAuthService).not.toBe(secondAuthService);
    expect(firstAuthService).not.toBe(thirdAuthService);
    expect(secondAuthService).not.toBe(thirdAuthService);
  });

  it('should create services with wristbandAuth property', () => {
    expect(firstAuthService.wristbandAuth).toBeDefined();
    expect(secondAuthService.wristbandAuth).toBeDefined();
    expect(thirdAuthService.wristbandAuth).toBeDefined();

    // Check that each service has its own wristbandAuth instance
    expect(firstAuthService.wristbandAuth).not.toBe(secondAuthService.wristbandAuth);
    expect(firstAuthService.wristbandAuth).not.toBe(thirdAuthService.wristbandAuth);
    expect(secondAuthService.wristbandAuth).not.toBe(thirdAuthService.wristbandAuth);
  });

  it('should use default token when no token provided', async () => {
    const defaultModule = await Test.createTestingModule({
      imports: [
        WristbandExpressAuthModule.forRootAsync({
          useFactory: () => config,
        }), // No token provided, should use DEFAULT_AUTH_TOKEN
      ],
    }).compile();

    const defaultService = defaultModule.get<WristbandExpressAuthService>(DEFAULT_AUTH_TOKEN);
    expect(defaultService).toBeDefined();
    
    await defaultModule.close();
  });
});
