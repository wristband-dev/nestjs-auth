import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { WristbandAuthService } from '../auth.service';
import { RequestWithSession } from '../types';

describe('SessionService', () => {
  let service: SessionService;
  let wristbandAuthService: WristbandAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: WristbandAuthService,
          useValue: {
            getSessionCookieMaxAge: jest.fn().mockReturnValue(3600),
            getSecureCookiesEnabled: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    wristbandAuthService = module.get<WristbandAuthService>(WristbandAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('expiresAtWithBuffer', () => {
    it('should return the correct expiration time with buffer', () => {
      const numOfSeconds = 3600;
      const expectedExpiration = Date.now() + (numOfSeconds - 300) * 1000;
      const result = service.expiresAtWithBuffer(numOfSeconds);

      expect(result).toBeCloseTo(expectedExpiration, -2);
    });
  });

  describe('createCsrfSecret', () => {
    it('should generate a CSRF secret', () => {
      const secret = service.createCsrfSecret();
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
    });
  });

  describe('isCsrfTokenValid', () => {
    it('should validate the CSRF token correctly', () => {
      const secret = service.createCsrfSecret();
      const token = service['csrfTokens'].create(secret);
      const req = {
        headers: {
          'x-xsrf-token': token,
        },
        session: {
          csrfSecret: secret,
        },
      } as unknown as RequestWithSession;

      const isValid = service.isCsrfTokenValid(req);
      expect(isValid).toBe(true);
    });

    it('should invalidate an incorrect CSRF token', () => {
      const secret = service.createCsrfSecret();
      const req = {
        headers: {
          'x-xsrf-token': 'invalid-token',
        },
        session: {
          csrfSecret: secret,
        },
      } as unknown as RequestWithSession;

      const isValid = service.isCsrfTokenValid(req);
      expect(isValid).toBe(false);
    });
  });

  describe('SessionService additional tests', () => {
    describe('expiresAtWithBuffer edge cases', () => {
      it('should handle zero seconds correctly', () => {
        const numOfSeconds = 0;
        const expectedExpiration = Date.now() - 300 * 1000;
        const result = service.expiresAtWithBuffer(numOfSeconds);
        expect(result).toBeCloseTo(expectedExpiration, -2);
      });

      it('should handle large values correctly', () => {
        const numOfSeconds = 10**6;
        const expectedExpiration = Date.now() + (numOfSeconds - 300) * 1000;
        const result = service.expiresAtWithBuffer(numOfSeconds);
        expect(result).toBeCloseTo(expectedExpiration, -2);
      });
    });

    describe('createCsrfSecret uniqueness', () => {
      it('should generate unique CSRF secrets', () => {
        const secret1 = service.createCsrfSecret();
        const secret2 = service.createCsrfSecret();
        expect(secret1).not.toBe(secret2);
      });
    });

    describe('isCsrfTokenValid edge cases', () => {
      it('should invalidate when x-xsrf-token header is missing', () => {
        const secret = service.createCsrfSecret();
        const req = {
          headers: {},
          session: {
            csrfSecret: secret,
          },
        } as RequestWithSession;

        const isValid = service.isCsrfTokenValid(req);
        expect(isValid).toBe(false);
      });

      it('should invalidate when csrfSecret is missing in session', () => {
        const token = service['csrfTokens'].create('dummy-secret');
        const req = {
          headers: {
            'x-xsrf-token': token,
          },
          session: {},
        } as unknown as RequestWithSession;

        const isValid = service.isCsrfTokenValid(req);
        expect(isValid).toBe(false);
      });
    });
  });
});
