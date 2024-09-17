import { WristbandAuthService } from '../auth.service';
import type { AuthConfig, WristbandAuth } from '@wristband/express-auth';
import type { AuthServiceConfig } from '../auth.service';

describe('WristbandAuthService', () => {
  let service: WristbandAuthService;
  let config: AuthServiceConfig;

  beforeEach(() => {
    config = {
      clientId: 'soibgmqekjhsjpk3crzd5ohjni',
      clientSecret: 'b03b7e19b927384e10f71ada872aae09',
      loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
      loginUrl: 'http://localhost:3002',
      redirectUri: 'http://localhost:3002',
      wristbandApplicationDomain: 'http://localhost:3002',
    } as AuthServiceConfig;
    service = new WristbandAuthService(config);
    jest.spyOn(service, 'createWristbandAuth');
    service.createWristbandAuth(config);
  });

  it('should call createWristbandAuth with the correct config on instantiation', () => {
    expect(service.createWristbandAuth).toHaveBeenCalledWith(config);
  });

  describe('createWristbandAuth', () => {
    it('should create wristbandAuth with valid config', () => {
      const validConfig = { 
        clientId: 'soibgmqekjhsjpk3crzd5ohjni',
        clientSecret: 'b03b7e19b927384e10f71ada872aae09',
        loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
        loginUrl: 'http://localhost:3002',
        redirectUri: 'http://localhost:3002',
        wristbandApplicationDomain: 'http://localhost:3002',
       } as AuthConfig;
      service.createWristbandAuth(validConfig);
      expect(service.createWristbandAuth).toHaveBeenCalledWith(validConfig);
    });

    it('should throw an error with invalid config', () => {
      const invalidConfig = {
        clientId: '',
        clientSecret: '',
        loginStateSecret: '',
        loginUrl: ''
      } as AuthConfig;
      expect(() => service.createWristbandAuth(invalidConfig)).toThrow();
    });
  });

  describe('getLogin', () => {
    it('should call wristbandAuth.login with req and res', () => {
      const req = {};
      const res = {};
      service.wristbandAuth = {
        login: jest.fn(),
      } as unknown as WristbandAuth;
      service.getLogin(req, res);
      expect(service.wristbandAuth.login).toHaveBeenCalledWith(req, res);
    });
  });
});
