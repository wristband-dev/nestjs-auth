import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareConsumer } from '@nestjs/common';
import { WristbandModule } from './auth.module';
import { WristbandAuthService } from './auth.service';
import { SessionService } from './utils/session.service';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { WristbandAuthMiddleware } from './middleware/wristband-auth.middleware';

type MiddlewareConsumerMock = jest.Mocked<MiddlewareConsumer> & { forRoutes: jest.Mock };

describe('WristbandModule', () => {
  let module: TestingModule;
  let wristbandAuthService: WristbandAuthService;
  let middlewareConsumer: MiddlewareConsumerMock;
  let wristbandSessionService: SessionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [WristbandModule],
    })
      .overrideProvider(WristbandAuthService)
      .useValue({
        getWristbandAuthRoutes: jest.fn().mockReturnValue(...['/auth']),
        getCsrfMiddlewareRoutes: jest.fn().mockReturnValue(...['/csrf']),
      })
      .overrideProvider(SessionService).useValue({
        getSessionCookieMaxAge: jest.fn().mockReturnValue(1800),
      })
      .compile();

    wristbandAuthService = module.get<WristbandAuthService>(WristbandAuthService);
    wristbandSessionService = module.get<SessionService>(SessionService);
    middlewareConsumer = {
      apply: jest.fn().mockReturnThis(),
      forRoutes: jest.fn(),
    };
  });

  it('should be defined', () => {
    const wristbandModule = module.get<WristbandModule>(WristbandModule);
    expect(wristbandModule).toBeDefined();
  });

  it('should configure middleware', () => {
    const wristbandModule = module.get<WristbandModule>(WristbandModule);
    wristbandModule.configure(middlewareConsumer);

    expect(middlewareConsumer.apply).toHaveBeenCalledWith(WristbandAuthMiddleware);
    expect(middlewareConsumer.apply).toHaveBeenCalledWith(CsrfMiddleware);
  });
});