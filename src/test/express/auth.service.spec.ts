import type { WristbandAuth } from '@wristband/express-auth';
import { Request, Response } from 'express';

import type { AuthConfig } from '../../types';
import { WristbandExpressAuthService } from '../../express/express-auth.service';

describe('WristbandExpressAuthService', () => {
  let service: WristbandExpressAuthService;
  let config: AuthConfig;

  beforeEach(() => {
    config = {
      clientId: 'soibgmqekjhsjpk3crzd5ohjni',
      clientSecret: 'b03b7e19b927384e10f71ada872aae09',
      loginStateSecret: 'Toa903rKynt3YxXKUG7Pvs3ZZPrQVPLi',
      loginUrl: 'http://localhost:3002',
      redirectUri: 'http://localhost:3002',
      wristbandApplicationDomain: 'http://localhost:3002',
    } as AuthConfig;
    service = new WristbandExpressAuthService(config);
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
        loginUrl: '',
      } as AuthConfig;
      expect(() => {
        return service.createWristbandAuth(invalidConfig);
      }).toThrow();
    });
  });

  describe('login', () => {
    it('should call wristbandAuth.login with req and res', () => {
      const req = {
        params: {},
        query: {},
        body: {},
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      service.wristbandAuth = {
        login: jest.fn(),
      } as unknown as WristbandAuth;
      service.login(req, res);
      expect(service.wristbandAuth.login).toHaveBeenCalledWith(req, res);
    });

    it('should call wristbandAuth.login with req, res, and loginConfig', () => {
      const req = {
        params: {},
        query: {},
        body: {},
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      service.wristbandAuth = {
        login: jest.fn(),
      } as unknown as WristbandAuth;
      const loginConfig = { defaultTenantCustomDomain: 'global' };
      service.login(req, res, loginConfig);
      expect(service.wristbandAuth.login).toHaveBeenCalledWith(req, res, loginConfig);
    });
  });

  describe('callback', () => {
    it('should call wristbandAuth.callback with req and res', () => {
      const req = {
        params: {},
        query: {},
        body: {},
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      service.wristbandAuth = {
        callback: jest.fn(),
      } as unknown as WristbandAuth;
      service.callback(req, res);
      expect(service.wristbandAuth.callback).toHaveBeenCalledWith(req, res);
    });
  });

  describe('logout', () => {
    it('should call wristbandAuth.logout with req and res', () => {
      const req = {
        params: {},
        query: {},
        body: {},
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      service.wristbandAuth = {
        logout: jest.fn(),
      } as unknown as WristbandAuth;
      service.logout(req, res);
      expect(service.wristbandAuth.logout).toHaveBeenCalledWith(req, res);
    });

    it('should call wristbandAuth.logout with req, res, and logoutConfig', () => {
      const req = {
        params: {},
        query: {},
        body: {},
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;
      service.wristbandAuth = {
        logout: jest.fn(),
      } as unknown as WristbandAuth;
      const logoutConfig = { tenantDomainName: 'global' };
      service.logout(req, res, logoutConfig);
      expect(service.wristbandAuth.logout).toHaveBeenCalledWith(req, res, logoutConfig);
    });
  });

  describe('refreshTokenIfExpired', () => {
    it('should call wristbandAuth.refreshTokenIfExpired with refreshToken and expiresAt', () => {
      service.wristbandAuth = {
        refreshTokenIfExpired: jest.fn(),
      } as unknown as WristbandAuth;
      service.refreshTokenIfExpired('token', 1234567890);
      expect(service.wristbandAuth.refreshTokenIfExpired).toHaveBeenCalledWith('token', 1234567890);
    });
  });
});
