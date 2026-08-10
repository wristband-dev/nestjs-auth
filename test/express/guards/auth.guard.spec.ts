import { Test } from '@nestjs/testing';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { createWristbandAuthGuard } from '../../../src/express/guards/auth.guard';
import { WristbandExpressAuthService } from '../../../src/express/auth/auth.service';
import type { AuthGuardConfig } from '../../../src/express/types/auth-guard.types';
import { DEFAULT_AUTH_TOKEN } from '../../../src/express/constants';

describe('createWristbandAuthGuard', () => {
  let mockAuthService: jest.Mocked<WristbandExpressAuthService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockAuthMiddleware: jest.Mock;
  let guardConfig: AuthGuardConfig;

  beforeEach(() => {
    // Setup mock auth middleware
    mockAuthMiddleware = jest.fn((req, res, next) => next());

    // Setup mock auth service
    mockAuthService = {
      wristbandAuth: {
        createAuthMiddleware: jest.fn().mockReturnValue(mockAuthMiddleware),
      },
    } as any;

    // Setup guard config
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

    // Setup mock config service
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

    it('should call createAuthMiddleware with guard config', async () => {
      const Guard = createWristbandAuthGuard();

      const module = await Test.createTestingModule({
        providers: [
          Guard,
          { provide: DEFAULT_AUTH_TOKEN, useValue: mockAuthService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      module.get(Guard);
      expect(mockAuthService.wristbandAuth.createAuthMiddleware).toHaveBeenCalledWith(guardConfig);
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

      mockRequest = {};
      mockResponse = {};
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;
    });

    it('should return true when auth middleware succeeds', async () => {
      mockAuthMiddleware.mockImplementation((req, res, next) => next());

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(mockAuthMiddleware).toHaveBeenCalledWith(mockRequest, mockResponse, expect.any(Function));
    });

    it('should throw UnauthorizedException for 401 errors', async () => {
      const error = { status: 401, message: 'Unauthorized access' };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Unauthorized access');
    });

    it('should throw ForbiddenException for 403 errors', async () => {
      const error = { status: 403, message: 'Forbidden resource' };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Forbidden resource');
    });

    it('should throw InternalServerErrorException for 500 errors', async () => {
      const error = { status: 500, message: 'Server error' };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(InternalServerErrorException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Server error');
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const error = { message: 'Unknown error' };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(InternalServerErrorException);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Unknown error');
    });

    it('should use statusCode if status is not present', async () => {
      const error = { statusCode: 401, message: 'Unauthorized' };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should use default error messages when not provided', async () => {
      const error401 = { status: 401 };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error401));
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Unauthorized');

      const error403 = { status: 403 };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error403));
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Forbidden');

      const error500 = { status: 500 };
      mockAuthMiddleware.mockImplementation((req, res, next) => next(error500));
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow('Internal server error');
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
      expect(mockAuthService.wristbandAuth.createAuthMiddleware).toHaveBeenCalledWith(config1);
      expect(mockAuthService.wristbandAuth.createAuthMiddleware).toHaveBeenCalledWith(config2);
    });
  });
});
