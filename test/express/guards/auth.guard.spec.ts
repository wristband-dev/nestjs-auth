import { Test } from '@nestjs/testing';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { WristbandError } from '@wristband/typescript-auth';

import { createWristbandAuthGuard } from '../../../src/express/guards/auth.guard';
import { WristbandExpressAuthService } from '../../../src/express/auth/auth.service';
import type { AuthGuardConfig } from '../../../src/express/types/auth-guard.types';
import { DEFAULT_AUTH_TOKEN } from '../../../src/express/constants';

describe('createWristbandAuthGuard', () => {
  let mockAuthService: jest.Mocked<WristbandExpressAuthService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAuthenticate: jest.Mock;
  let guardConfig: AuthGuardConfig;

  beforeEach(() => {
    mockAuthenticate = jest
      .fn()
      .mockResolvedValue({ authenticated: true, usedStrategy: 'JWT', jwtPayload: {}, jwt: 't' });

    mockAuthService = {
      wristbandAuth: {
        authenticate: mockAuthenticate,
      },
    } as any;

    guardConfig = {
      authStrategies: ['JWT', 'SESSION'],
      sessionConfig: {
        sessionOptions: {
          secrets: 'test-secret',
          secure: false,
          enableCsrfProtection: true,
        },
      },
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(guardConfig),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Guard Creation - All Permutations', () => {
    it('should create guard with default configKey and default authToken', async () => {
      const Guard = createWristbandAuthGuard();

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get(Guard);
      expect(mockConfigService.get).toHaveBeenCalledWith('wristbandAuthGuard');
    });

    it('should create guard with custom configKey and default authToken', async () => {
      const Guard = createWristbandAuthGuard('customConfig');

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get(Guard);
      expect(mockConfigService.get).toHaveBeenCalledWith('customConfig');
    });

    it('should create guard with default configKey and custom authToken', async () => {
      const customToken = 'CUSTOM_AUTH_TOKEN';
      const Guard = createWristbandAuthGuard(undefined, customToken);

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: customToken, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get(Guard);
      expect(mockConfigService.get).toHaveBeenCalledWith('wristbandAuthGuard');
    });

    it('should create guard with custom configKey and custom authToken', async () => {
      const customToken = 'CUSTOM_AUTH_TOKEN';
      const Guard = createWristbandAuthGuard('customConfig', customToken);

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: customToken, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get(Guard);
      expect(mockConfigService.get).toHaveBeenCalledWith('customConfig');
    });

    it('should create a guard class', () => {
      const Guard = createWristbandAuthGuard();
      expect(Guard).toBeDefined();
      expect(typeof Guard).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should throw error if auth service is not found', async () => {
      const Guard = createWristbandAuthGuard();

      await expect(
        Test.createTestingModule({
          providers: [
            Guard,
            { provide: DEFAULT_AUTH_TOKEN, useValue: null },
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile()
      ).rejects.toThrow('WristbandExpressAuthService not found');
    });

    it('should throw error if guard config is not found', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const Guard = createWristbandAuthGuard();

      await expect(
        Test.createTestingModule({
          providers: [
            Guard,
            { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile()
      ).rejects.toThrow(/Auth guard configuration not found for key/);
    });

    it('should throw error if no auth strategies provided', async () => {
      mockConfigService.get.mockReturnValue({ authStrategies: [] });
      const Guard = createWristbandAuthGuard();

      await expect(
        Test.createTestingModule({
          providers: [
            Guard,
            { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile()
      ).rejects.toThrow('Auth guard requires at least one auth strategy');
    });

    it('should throw error if SESSION strategy used without sessionConfig', async () => {
      mockConfigService.get.mockReturnValue({
        authStrategies: ['SESSION'],
      });
      const Guard = createWristbandAuthGuard();

      await expect(
        Test.createTestingModule({
          providers: [
            Guard,
            { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile()
      ).rejects.toThrow('SESSION auth strategy requires sessionConfig.sessionOptions');
    });

    it('should throw error if SESSION strategy used without secrets', async () => {
      mockConfigService.get.mockReturnValue({
        authStrategies: ['SESSION'],
        sessionConfig: {
          sessionOptions: { secrets: '' },
        },
      });
      const Guard = createWristbandAuthGuard();

      await expect(
        Test.createTestingModule({
          providers: [
            Guard,
            { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile()
      ).rejects.toThrow('SESSION auth strategy requires sessionConfig.sessionOptions.secrets');
    });

    it('should accept valid JWT-only configuration', async () => {
      mockConfigService.get.mockReturnValue({
        authStrategies: ['JWT'],
      });
      const Guard = createWristbandAuthGuard();

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const guard = module.get(Guard);
      expect(guard).toBeDefined();
    });
  });

  describe('canActivate', () => {
    let guard: any;
    let mockExecutionContext: jest.Mocked<ExecutionContext>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(async () => {
      const Guard = createWristbandAuthGuard();

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      guard = module.get(Guard);

      mockRequest = { session: { save: jest.fn() } } as any;
      mockResponse = {};
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;
    });

    it('should return true when authenticate succeeds', async () => {
      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(mockAuthenticate).toHaveBeenCalledWith(mockRequest, guardConfig, mockRequest.session);
    });

    it('should attach req.auth on JWT success', async () => {
      mockAuthenticate.mockResolvedValue({
        authenticated: true,
        usedStrategy: 'JWT',
        jwtPayload: { sub: 'user-1' },
        jwt: 'token',
      });

      await guard.canActivate(mockExecutionContext);
      expect((mockRequest as any).auth).toEqual({ sub: 'user-1', jwt: 'token' });
    });

    it('should throw UnauthorizedException for not_authenticated', async () => {
      mockAuthenticate.mockResolvedValue({ authenticated: false, reason: 'not_authenticated' });
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Unauthorized');
    });

    it('should throw UnauthorizedException for token_refresh_failed', async () => {
      mockAuthenticate.mockResolvedValue({ authenticated: false, reason: 'token_refresh_failed' });
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException for csrf_failed', async () => {
      mockAuthenticate.mockResolvedValue({ authenticated: false, reason: 'csrf_failed' });
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Forbidden');
    });

    it('should throw InternalServerErrorException for unexpected_error', async () => {
      mockAuthenticate.mockResolvedValue({ authenticated: false, reason: 'unexpected_error' });
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(InternalServerErrorException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Internal server error');
    });

    it('should throw InternalServerErrorException for session_not_configured', async () => {
      mockAuthenticate.mockRejectedValue(new WristbandError('session_not_configured', 'missing session'));
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Multiple Guard Instances', () => {
    it('should create distinct guard classes', () => {
      const Guard1 = createWristbandAuthGuard('config1');
      const Guard2 = createWristbandAuthGuard('config2');

      expect(Guard1).not.toBe(Guard2);
    });

    it('should allow different guards to use different configs', async () => {
      const config1 = { authStrategies: ['JWT'] };
      const config2 = {
        authStrategies: ['SESSION'],
        sessionConfig: {
          sessionOptions: { secrets: 'test-secret' },
        },
      };

      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'config1') return config1;
        if (key === 'config2') return config2;
        return undefined;
      });

      const Guard1 = createWristbandAuthGuard('config1');
      const Guard2 = createWristbandAuthGuard('config2');

      const module = await Test.createTestingModule({
        providers: [
          Guard1,
          Guard2,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const guard1 = module.get(Guard1);
      const guard2 = module.get(Guard2);

      expect(guard1).toBeDefined();
      expect(guard2).toBeDefined();
    });
  });
});
