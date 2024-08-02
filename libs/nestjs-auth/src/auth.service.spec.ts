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
});