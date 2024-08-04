import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WristbandAuthService as AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return CLIENT_ID', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-client-id');
    expect(service.getClientId()).toBe('test-client-id');
  });

  it('should log error if CLIENT_ID is not found', () => {
    jest.spyOn(configService, 'get').mockImplementation(() => {
      throw new Error('CLIENT_ID not found');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(service.getClientId()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('CLIENT_ID not found.');
  });

  it('should return CLIENT_SECRET', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-client-secret');
    expect(service.getClientSecret()).toBe('test-client-secret');
  });

  it('should log error if CLIENT_SECRET is not found', () => {
    jest.spyOn(configService, 'get').mockImplementation(() => {
      throw new Error('CLIENT_SECRET not found');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(service.getClientSecret()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('CLIENT_SECRET not found.');
  });

  it('should return CSRF_TOKEN_COOKIE_NAME', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-csrf-token-cookie-name');
    expect(service.getCsrfTokenCookieName()).toBe('test-csrf-token-cookie-name');
  });

  it('should log error if CSRF_TOKEN_COOKIE_NAME is not found', () => {
    jest.spyOn(configService, 'get').mockImplementation(() => {
      throw new Error('CSRF_TOKEN_COOKIE_NAME not found');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(service.getCsrfTokenCookieName()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('CSRF_TOKEN_COOKIE_NAME not found.');
  });

  it('should return CALLBACK_URL', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-callback-url');
    expect(service.getCallbackUrl()).toBe('test-callback-url');
  });

  it('should log error if CALLBACK_URL is not found', () => {
    jest.spyOn(configService, 'get').mockImplementation(() => {
      throw new Error('CALLBACK_URL not found');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    expect(service.getCallbackUrl()).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('CALLBACK_URL not found.');
  });

  it('should return DOMAIN_FORMAT', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-domain-format');
    expect(service.getDomainFormat()).toBe('test-domain-format');
  });

  it('should return LOGIN_URL', () => {
    jest.spyOn(configService, 'get').mockReturnValue('test-login-url');
    expect(service.getLoginUrl()).toBe('test-login-url');
  });

  describe('AuthService getter methods', () => {
    let service: AuthService;
    let configService: ConfigService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(),
            },
          },
        ],
      }).compile();
  
      service = module.get<AuthService>(AuthService);
      configService = module.get<ConfigService>(ConfigService);
    });
  
    it('should return the correct value for getWristbandApplicationDomain', () => {
      const mockValue = 'http://example.com';
      jest.spyOn(configService, 'get').mockReturnValue(mockValue);
  
      const result = service.getWristbandApplicationDomain();
      expect(result).toBe(mockValue);
      expect(configService.get).toHaveBeenCalledWith('WRISTBAND_APPLICATION_DOMAIN');
    });

    it('should return the correct value for getPort', () => {
      const mockValue = '3000';
      jest.spyOn(configService, 'get').mockReturnValue(mockValue);

      const result = service.getPort();
      expect(result).toBe(mockValue);
      expect(configService.get).toHaveBeenCalledWith('PORT');
    });

    it('should return the correct value for getNodeEnv', () => {
      const mockValue = 'development';
      jest.spyOn(configService, 'get').mockReturnValue(mockValue);

      const result = service.getNodeEnv();
      expect(result).toBe(mockValue);
      expect(configService.get).toHaveBeenCalledWith('NODE_ENV');
    });

    it('should return the correct routes for getWristbandAuthRoutes when routes are provided', () => {
      const mockRoutes = ['route1', 'route2'];
      const result = service.getWristbandAuthRoutes(mockRoutes);
      expect(result).toEqual(mockRoutes);
    });

    it('should return the correct routes for getWristbandAuthRoutes when routes are not provided', () => {
      const mockValue = 'route1,route2';
      jest.spyOn(configService, 'get').mockReturnValue(mockValue);

      const result = service.getWristbandAuthRoutes();
      expect(result).toEqual(['route1', 'route2']);
      expect(configService.get).toHaveBeenCalledWith('WRISTBAND_AUTH_MIDDLEWARE_ROUTES');
    });

    it('should return the correct routes for getCsrfMiddlewareRoutes when routes are provided', () => {
      const mockRoutes = ['route1', 'route2'];
      const result = service.getCsrfMiddlewareRoutes(mockRoutes);
      expect(result).toEqual(mockRoutes);
    });

    it('should return the correct routes for getCsrfMiddlewareRoutes when routes are not provided', () => {
      const mockValue = 'route1,route2';
      jest.spyOn(configService, 'get').mockReturnValue(mockValue);

      const result = service.getCsrfMiddlewareRoutes();
      expect(result).toEqual(['route1', 'route2']);
      expect(configService.get).toHaveBeenCalledWith('WRISTBAND_CSRF_MIDDLEWARE_ROUTES');
    });

    it('should return an empty array if an error occurs in getWristbandAuthRoutes', () => {
      jest.spyOn(configService, 'get').mockImplementation(() => {
        throw new Error('WRISTBAND_AUTH_MIDDLEWARE_ROUTES not found');
      });

      const result = service.getWristbandAuthRoutes();
      expect(result).toEqual([]);
    });
  });
});

