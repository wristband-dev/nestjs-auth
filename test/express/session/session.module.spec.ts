import { Test, TestingModule } from '@nestjs/testing';
import type { SessionOptions } from '@wristband/typescript-session';

import { WristbandExpressSessionModule } from '../../../src/express/session/session.module';
import { WristbandExpressSessionMiddleware } from '../../../src/express/session/session.middleware';
import { SESSION_OPTIONS_TOKEN } from '../../../src/express/constants';

// Mock the session middleware to avoid importing the actual express-auth/session
jest.mock('../../../src/express/session/session.middleware');

describe('WristbandExpressSessionModule', () => {
  let module: TestingModule;
  let sessionOptions: SessionOptions;

  beforeEach(() => {
    sessionOptions = {
      secrets: 'test-secret',
      secure: false,
      enableCsrfProtection: true,
    };
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(WristbandExpressSessionModule).toBeDefined();
  });

  it('should create module with forRootAsync', async () => {
    module = await Test.createTestingModule({
      imports: [
        WristbandExpressSessionModule.forRootAsync({
          useFactory: () => sessionOptions,
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide SESSION_OPTIONS_TOKEN with session options', async () => {
    module = await Test.createTestingModule({
      imports: [
        WristbandExpressSessionModule.forRootAsync({
          useFactory: () => sessionOptions,
        }),
      ],
    }).compile();

    const providedOptions = module.get<SessionOptions>(SESSION_OPTIONS_TOKEN);
    expect(providedOptions).toEqual(sessionOptions);
  });

  it('should provide WristbandExpressSessionMiddleware', async () => {
    module = await Test.createTestingModule({
      imports: [
        WristbandExpressSessionModule.forRootAsync({
          useFactory: () => sessionOptions,
        }),
      ],
    }).compile();

    const middleware = module.get<WristbandExpressSessionMiddleware>(WristbandExpressSessionMiddleware);
    expect(middleware).toBeDefined();
  });

  it('should support async factory with injected dependencies', async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('injected-secret'),
    };

    // Create a mock module that provides ConfigService
    const MockConfigModule = {
      module: class MockConfigModule {},
      providers: [
        {
          provide: 'ConfigService',
          useValue: mockConfigService,
        },
      ],
      exports: ['ConfigService'],
    };

    module = await Test.createTestingModule({
      imports: [
        WristbandExpressSessionModule.forRootAsync({
          imports: [MockConfigModule], // Import the module here
          useFactory: (configService: any) => ({
            secrets: configService.get('SESSION_SECRET'),
            secure: true,
            enableCsrfProtection: true,
          }),
          inject: ['ConfigService'],
        }),
      ],
    }).compile();

    const providedOptions = module.get<SessionOptions>(SESSION_OPTIONS_TOKEN);
    expect(providedOptions.secrets).toBe('injected-secret');
    expect(providedOptions.secure).toBe(true);
    expect(mockConfigService.get).toHaveBeenCalledWith('SESSION_SECRET');
  });

  it('should support importing other modules', async () => {
    const MockConfigModule = {
      module: class MockConfigModule {},
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: { sessionSecret: 'from-config-module' },
        },
      ],
      exports: ['CONFIG_OPTIONS'],
    };

    module = await Test.createTestingModule({
      imports: [
        WristbandExpressSessionModule.forRootAsync({
          imports: [MockConfigModule],
          useFactory: (configOptions: any) => ({
            secrets: configOptions.sessionSecret,
            secure: false,
            enableCsrfProtection: true,
          }),
          inject: ['CONFIG_OPTIONS'],
        }),
      ],
    }).compile();

    const providedOptions = module.get<SessionOptions>(SESSION_OPTIONS_TOKEN);
    expect(providedOptions.secrets).toBe('from-config-module');
  });

  it('should be a global module', async () => {
    const dynamicModule = WristbandExpressSessionModule.forRootAsync({
      useFactory: () => sessionOptions,
    });

    expect(dynamicModule.global).toBe(true);
  });

  it('should export SESSION_OPTIONS_TOKEN and middleware', async () => {
    const dynamicModule = WristbandExpressSessionModule.forRootAsync({
      useFactory: () => sessionOptions,
    });

    expect(dynamicModule.exports).toContain(SESSION_OPTIONS_TOKEN);
    expect(dynamicModule.exports).toContain(WristbandExpressSessionMiddleware);
  });
});
