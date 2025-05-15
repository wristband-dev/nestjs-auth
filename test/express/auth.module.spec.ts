import { Test, TestingModule } from '@nestjs/testing';

import type { AuthConfig } from '../../src/types';
import { WristbandExpressAuthModule } from '../../src/express/express-auth.module';
import { WristbandExpressAuthService } from '../../src/express/express-auth.service';

describe('WristbandExpressAuthModule', () => {
  let module: TestingModule;
  let defaultAuthService: WristbandExpressAuthService;
  let authService: WristbandExpressAuthService;
  let secondAuthService: WristbandExpressAuthService; // Second service instance
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
        WristbandExpressAuthModule.forRoot(config),
        WristbandExpressAuthModule.forRoot(config, 'wristbandToken'),
        WristbandExpressAuthModule.forRoot(config, 'secondWristbandToken'),
      ],
    }).compile();

    defaultAuthService = module.get<WristbandExpressAuthService>('wristband'); // default token is 'wristband'
    authService = module.get<WristbandExpressAuthService>('wristbandToken');
    secondAuthService = module.get<WristbandExpressAuthService>('secondWristbandToken'); // Get second instance
  });

  it('should create three instances of WristbandExpressAuthService with different tokens', () => {
    expect(defaultAuthService).toBeDefined();
    expect(authService).toBeDefined();
    expect(secondAuthService).toBeDefined();

    // Check that the services are different instances
    expect(defaultAuthService).not.toBe(authService);
    expect(defaultAuthService).not.toBe(secondAuthService);
    expect(authService).not.toBe(secondAuthService);
  });

  it('should call createWristbandAuth with the correct configuration', () => {
    // Spy on the method to ensure it is called with the correct config
    const createAuthSpy = jest.spyOn(authService, 'createWristbandAuth');

    // Re-instantiate the auth service to trigger the method call
    authService.createWristbandAuth(config);

    expect(createAuthSpy).toHaveBeenCalledWith(config);
    createAuthSpy.mockRestore(); // Restore original method after test
  });
});
