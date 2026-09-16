import { Test } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthConfig } from '@wristband/typescript-auth';

import { createWristbandAuthGuard } from '../../../src/express/guards/auth.guard';
import { WristbandExpressAuthService } from '../../../src/express/auth/auth.service';
import type { AuthGuardConfig } from '../../../src/express/types/auth-guard.types';
import { DEFAULT_AUTH_TOKEN } from '../../../src/express/constants';

/**
 * Integration coverage for the guard wired to a real WristbandExpressAuthService and therefore the real
 * @wristband/typescript-auth core. Unlike auth.guard.spec.ts nothing is mocked. Every case is chosen so that
 * no request to Wristband is made: auto-configuration is disabled, no token refresh is triggered, and JWT cases
 * fail before any JWKS lookup.
 */

const authConfig: AuthConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  wristbandApplicationVanityDomain: 'auth.example.wristband.dev',
  autoConfigureEnabled: false,
  loginUrl: 'http://localhost/auth/login',
  redirectUri: 'http://localhost/auth/callback',
  loginStateSecret: 'a'.repeat(32),
};

const sessionOptions = { secrets: 'b'.repeat(32) };

const guardConfigs: Record<string, AuthGuardConfig> = {
  jwtGuard: { authStrategies: ['JWT'] },
  sessionGuard: { authStrategies: ['SESSION'], sessionConfig: { sessionOptions } },
  csrfGuard: {
    authStrategies: ['SESSION'],
    sessionConfig: { sessionOptions: { ...sessionOptions, enableCsrfProtection: true } },
  },
  multiGuard: { authStrategies: ['SESSION', 'JWT'], sessionConfig: { sessionOptions } },
};

type FakeSession = Record<string, unknown> & { saveCount: number; save: () => Promise<void> };

function createSession(data: Record<string, unknown>): FakeSession {
  const session: FakeSession = {
    ...data,
    saveCount: 0,
    async save() {
      session.saveCount += 1;
    },
  };
  return session;
}

function createContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
  } as unknown as ExecutionContext;
}

async function buildGuard(configKey: string) {
  const Guard = createWristbandAuthGuard(configKey, DEFAULT_AUTH_TOKEN);
  const module = await Test.createTestingModule({
    providers: [
      Guard,
      { provide: DEFAULT_AUTH_TOKEN, useValue: new WristbandExpressAuthService(authConfig) },
      { provide: ConfigService, useValue: { get: (key: string) => guardConfigs[key] } },
    ],
  }).compile();
  return module.get(Guard);
}

describe('createWristbandAuthGuard (integration with the real typescript-auth core)', () => {
  describe('JWT strategy', () => {
    it('rejects a request with no Authorization header', async () => {
      const guard = await buildGuard('jwtGuard');
      await expect(guard.canActivate(createContext({ headers: {} }))).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a request whose Authorization header is not a Bearer token', async () => {
      const guard = await buildGuard('jwtGuard');
      await expect(guard.canActivate(createContext({ headers: { authorization: 'Basic abc' } }))).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('SESSION strategy', () => {
    it('throws a 500 with a descriptive message when the session middleware is not installed', async () => {
      const guard = await buildGuard('sessionGuard');
      const context = createContext({ headers: {} });
      await expect(guard.canActivate(context)).rejects.toThrow(InternalServerErrorException);
      await expect(guard.canActivate(context)).rejects.toThrow('session middleware must be used');
    });

    it('rejects an unauthenticated session', async () => {
      const guard = await buildGuard('sessionGuard');
      const request = { headers: {}, session: createSession({ isAuthenticated: false }) };
      await expect(guard.canActivate(createContext(request))).rejects.toThrow(UnauthorizedException);
    });

    it('accepts an authenticated session, saves it, and initializes req.auth', async () => {
      const guard = await buildGuard('sessionGuard');
      const request: Record<string, unknown> = { headers: {}, session: createSession({ isAuthenticated: true }) };

      await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
      expect((request.session as FakeSession).saveCount).toBe(1);
      expect(request.auth).toEqual({});
    });

    it('rejects with 403 when CSRF protection is enabled and the header is missing', async () => {
      const guard = await buildGuard('csrfGuard');
      const request = { headers: {}, session: createSession({ isAuthenticated: true, csrfToken: 'tok' }) };
      await expect(guard.canActivate(createContext(request))).rejects.toThrow(ForbiddenException);
    });

    it('accepts when CSRF protection is enabled and the header matches the session token', async () => {
      const guard = await buildGuard('csrfGuard');
      const request = {
        headers: { 'x-csrf-token': 'tok' },
        session: createSession({ isAuthenticated: true, csrfToken: 'tok' }),
      };
      await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    });
  });

  describe('multiple strategies', () => {
    it('rejects when neither a session nor a bearer token is present', async () => {
      const guard = await buildGuard('multiGuard');
      const request = { headers: {}, session: createSession({ isAuthenticated: false }) };
      await expect(guard.canActivate(createContext(request))).rejects.toThrow(UnauthorizedException);
    });

    it('accepts an authenticated session without consulting the JWT strategy', async () => {
      const guard = await buildGuard('multiGuard');
      const request = { headers: {}, session: createSession({ isAuthenticated: true }) };
      await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    });
  });
});
