<div align="center">
  <a href="https://wristband.dev">
    <picture>
      <img src="https://assets.wristband.dev/images/email_branding_logo_v1.png" alt="Github" width="297" height="64">
    </picture>
  </a>
  <p align="center">
    Enterprise-ready auth that is secure by default, truly multi-tenant, and ungated for small businesses.
  </p>
  <p align="center">
    <b>
      <a href="https://wristband.dev">Website</a> •
      <a href="https://docs.wristband.dev/">Documentation</a>
    </b>
  </p>
</div>

<br/>

---

<br/>

# Wristband Multi-Tenant Authentication SDK for NestJS

[![npm package](https://img.shields.io/badge/npm%20i-nestjs--auth-brightgreen)](https://www.npmjs.com/package/@wristband/nestjs-auth)
[![version number](https://img.shields.io/github/v/release/wristband-dev/nestjs-auth?color=green&label=version)](https://github.com/wristband-dev/nestjs-auth/releases)
[![Actions Status](https://github.com/wristband-dev/nestjs-auth/workflows/Test/badge.svg)](https://github.com/wristband-dev/nestjs-auth/actions)
[![License](https://img.shields.io/github/license/wristband-dev/nestjs-auth)](https://github.com/wristband-dev/nestjs-auth/blob/main/LICENSE.md)

Enterprise-ready authentication for multi-tenant [NestJS applications](https://nestjs.com) using OAuth 2.1 and OpenID Connect standards. It supports both CommonJS and ES Modules and includes TypeScript declaration files.

<br>

## Overview

This SDK provides complete authentication integration with Wristband, including:

- **Login flow** - Redirect to Wristband and handle OAuth callbacks
- **Session management** - Encrypted cookie-based sessions with optional CSRF token protection
- **Token handling** - Automatic access token refresh and validation
- **Logout flow** - Token revocation and session cleanup
- **Multi-tenancy** - Support for tenant subdomains and custom domains

Learn more about Wristband's authentication patterns:

- [Backend Server Integration Pattern](https://docs.wristband.dev/docs/backend-server-integration)
- [Login Workflow In Depth](https://docs.wristband.dev/docs/login-workflow)

> **💡 Learn by Example**
>
> Want to see the SDK in action? Check out our [NestJS demo applications](#wristband-multi-tenant-nestjs-demo-app). The demo showcases real-world authentication patterns and best practices.

<br>

---

<br>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [1) Set Up the Express Auth Module](#1-set-up-the-express-auth-module)
  - [2) Set Up Session Management](#2-set-up-session-management)
  - [3) Create an Auth Guard](#3-create-an-auth-guard)
  - [4) Create Auth Controller with Auth Endpoints](#4-create-auth-controller-with-auth-endpoints)
    - [Login Endpoint](#login-endpoint)
    - [Callback Endpoint](#callback-endpoint)
    - [Logout Endpoint](#logout-endpoint)
    - [Session Endpoint](#session-endpoint)
    - [Token Endpoint (Optional)](#token-endpoint-optional)
  - [5) Create and Inject the AuthModule](#5-create-and-inject-the-authmodule)
  - [6) Protect Your API Routes](#6-protect-your-api-routes)
  - [7) Use Your Access Token with APIs](#7-use-your-access-token-with-apis)
- [Auth Configuration Options](#auth-configuration-options)
  - [WristbandExpressAuthModule and WristbandExpressAuthService](#wristbandexpressauthmodule-and-wristbandexpressauthservice)
  - [SDK Auto-Configuration](#sdk-auto-configuration)
- [Auth API](#auth-api)
- [Session Management](#session-management)
  - [WristbandExpressSessionModule](#wristbandexpresssessionmodule)
  - [Session Configuration](#session-configuration)
  - [The Session Object](#the-session-object)
  - [Session API](#session-api)
    - [session.fromCallback()](#sessionfromcallback)
    - [session.save()](#sessionsave)
    - [session.destroy()](#sessiondestroy)
    - [session.getSessionResponse()](#sessiongetsessionresponse)
    - [session.getTokenResponse()](#sessiongettokenresponse)
  - [CSRF Protection](#csrf-protection)
- [Authentication Guard](#authentication-guard)
  - [createWristbandAuthGuard()](#createwristbandauthguard)
  - [Guard Configuration](#guard-configuration)
  - [Authentication Strategies](#authentication-strategies)
    - [SESSION Strategy](#session-strategy)
    - [JWT Strategy](#jwt-strategy)
    - [Strategy Order](#strategy-order)
  - [Using the Guard](#using-the-guard)
  - [Guard Error Handling](#guard-error-handling)
- [Related Wristband SDKs](#related-wristband-sdks)
- [Wristband Multi-Tenant NestJS Demo App](#wristband-multi-tenant-nestjs-demo-app)
- [Questions](#questions)

<br>

## Prerequisites

> **⚡ Try Our NestJS Quickstart!**
>
> For the fastest way to get started with NestJS authentication, follow our [Quick Start Guide](https://docs.wristband.dev/docs/auth-quick-start). It walks you through setting up a working NestJS app with Wristband authentication in minutes. Refer back to this README for comprehensive documentation and advanced usage patterns.

Before installing, ensure you have:

- [Node.js](https://nodejs.org/en) >= 20.0.0
- [NestJS](https://nestjs.com/) >= 10.0.0
- Your preferred package manager (npm >= 9.6.0, yarn, pnpm, etc.)

> [!WARNING]
> This SDK currently only supports the Express framework. Reach out to the Wristband team if you are looking for Fastify support.

<br>

## Installation

```bash
# With npm
npm install @wristband/nestjs-auth

# Or with yarn
yarn add @wristband/nestjs-auth

# Or with pnpm
pnpm add @wristband/nestjs-auth
```

<br>

## Usage

The following steps will provide the suggested usage for this SDK, though you can certainly adjust as your project dictates.

### 1) Set Up the Express Auth Module

First, register a configuration factory using the SDK's `AuthConfig` type to define all necessary settings for your Wristband application. This configuration should correlate with how you've configured your application in the Wristband Dashboard.

```typescript
// src/config/wristband.config.ts

import { registerAs } from '@nestjs/config';
import type { AuthConfig } from '@wristband/nestjs-auth';

// Make sure your config values match what you configured in Wristband.
export const authConfig = registerAs('wristbandAuth', (): AuthConfig => ({
  clientId: "--your-client-id--",
  clientSecret: "--your-client-secret--",
  wristbandApplicationVanityDomain: "--your-wb-app-vanity-domain--",
}));
```

Next, import the `WristbandExpressAuthModule` from the SDK and add it to your `AppModule` imports. Use the `forRootAsync()` method to configure the module using NestJS's async provider pattern, which will make the `WristbandExpressAuthService` available globally throughout your application via dependency injection.

```typescript
// src/app.module.ts

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { env } from 'node:process';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

// Wristband Config
import { authConfig } from './config/wristband.config';

@Module({
  imports: [
    // Add the ConfigModule to access .env files
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      // Provide the env path resolution that is appropriate for your project.
      envFilePath: env.NODE_ENV === 'production' ? '' : '.env',
      ignoreEnvFile: env.NODE_ENV === 'production',
    }),

    // Inject the Wristband configurations.
    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth'),
      inject: [ConfigService],
    }),

    // ...any project-specific modules...
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // ...any middlewares needed by your app...
  }
}
```

### 2) Set Up Session Management

Wristband provides encrypted cookie-based session management built directly into this SDK, powered by [@wristband/typescript-session](https://github.com/wristband-dev/typescript-session).

First, register a configuration factory using the SDK's `SessionOptions` in your Wristband configuration file:

```typescript
// src/config/wristband.config.ts (continued)

import { registerAs } from '@nestjs/config';
import type { AuthConfig, SessionOptions } from '@wristband/nestjs-auth';

export const authConfig = registerAs('wristbandAuth', (): AuthConfig => ({
  clientId: "--your-client-id--",
  clientSecret: "--your-client-secret--",
  wristbandApplicationVanityDomain: "--your-wb-app-vanity-domain--",
}));

// These options can be shared between both session middleware and auth guards.
const sessionOptions: SessionOptions = {
  secrets: 'dummyval-b5c1-463a-812c-0d8db87c0ec5', // 32+ character secret
  maxAge: 3600, // 1 hour in seconds
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Session configuration for the session middleware.
 */
export const sessionConfig = registerAs('wristbandSession', (): SessionOptions => sessionOptions);
```

Next, do the following:

1. Import the `WristbandExpressSessionModule` from the SDK and add it to your `AppModule` imports. Use the `forRootAsync()` method to configure the module using NestJS's async provider pattern.
2. Import the `WristbandExpressSessionMiddleware` from the SDK and apply it globally to all routes using NestJS's middleware consumer.

```typescript
// src/app.module.ts (continued)

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { env } from 'node:process';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';
import {
  WristbandExpressSessionMiddleware,
  WristbandExpressSessionModule
} from '@wristband/nestjs-auth/session';

// Wristband Config
import { authConfig, sessionConfig } from './config/wristband.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Add your Session Middleware configuration to the ConfigModule
      load: [authConfig, sessionConfig],  // <-- ADD
      envFilePath: env.NODE_ENV === 'production' ? '' : '.env',
      ignoreEnvFile: env.NODE_ENV === 'production',
    }),

    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth'),
      inject: [ConfigService],
    }),

    // Inject the Wristband configurations needed by Session Middleware.
    WristbandExpressSessionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandSession'),
      inject: [ConfigService],
    }),

    // ...any project-specific modules...
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Configure the middleware for your app on all routes.
    // consumer.apply(WristbandExpressSessionMiddleware).forRoutes('*'); // v10.x
    consumer.apply(WristbandExpressSessionMiddleware).forRoutes('{*splat}'); // v11.x
    // ...any other middlewares needed by your app...
  }
}
```

Now your application can access the session via the `req.session` object.

> [!NOTE]
> If you prefer server-side sessions (Redis, databases, etc.) or want to use a different session library like [express-session](https://github.com/expressjs/session), you can skip importing `/session` and manage sessions however you'd like. Just make sure to store the Wristband tokens in your session after authentication.

<br>

### 3) Create an Auth Guard

To protect your application, you'll need to use the `createWristbandAuthGuard()` function to create an auth guard. You'll use that auth guard on your NestJS routes to enforce authentication on incoming requests.

First, create the guard file:

```typescript
// src/guards/auth.guard.ts

import { createWristbandAuthGuard } from '@wristband/nestjs-auth';

export const WristbandAuthGuard = createWristbandAuthGuard();
```

Next, register a configuration factory using the SDK's `AuthGuardConfig` in your Wristband configuration file to use the `SESSION` authentication strategy.

```typescript
// src/config/wristband.config.ts (continued)

import { registerAs } from '@nestjs/config';
import type { AuthConfig, SessionOptions, AuthGuardConfig } from '@wristband/nestjs-auth';

export const authConfig = registerAs('wristbandAuth', (): AuthConfig => ({
  clientId: "--your-client-id--",
  clientSecret: "--your-client-secret--",
  wristbandApplicationVanityDomain: "--your-wb-app-vanity-domain--",
}));

const sessionOptions: SessionOptions = {
  secrets: 'dummyval-b5c1-463a-812c-0d8db87c0ec5',
  maxAge: 3600,
  secure: process.env.NODE_ENV === 'production',
};

export const sessionConfig = registerAs('wristbandSession', (): SessionOptions => sessionOptions);

// Auth guard configuration that enforces a valid authenticated session
export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['SESSION'],
  sessionConfig: { sessionOptions },  // Rely on same options as session middleware
}));
```

Then, load these configurations into the `ConfigModule` that lives in `AppModule`:

```typescript
// src/app.module.ts (continued)

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { env } from 'node:process';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';
import {
  WristbandExpressSessionMiddleware,
  WristbandExpressSessionModule
} from '@wristband/nestjs-auth/session';

// Wristband Config
import { authConfig, sessionConfig, authGuardConfig } from './config/wristband.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Add your AuthGuard configuration to the ConfigModule
      load: [authConfig, sessionConfig, authGuardConfig],  // <-- ADD
      envFilePath: env.NODE_ENV === 'production' ? '' : '.env',
      ignoreEnvFile: env.NODE_ENV === 'production',
    }),

    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth'),
      inject: [ConfigService],
    }),
    WristbandExpressSessionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandSession'),
      inject: [ConfigService],
    }),

    // ...any project-specific modules...
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WristbandExpressSessionMiddleware).forRoutes('{*splat}');
    // ...any other middlewares needed by your app...
  }
}
```

<br>

### 4) Create Auth Controller with Auth Endpoints

There are **four core API endpoints** your NestJS server should expose to facilitate authentication workflows in Wristband:

- Login Endpoint
- Callback Endpoint
- Logout Endpoint
- Session Endpoint

You'll need to create an auth module that contains these endpoints. There's also one additional endpoint you can implement depending on your authentication needs:

- Token Endpoint (optional)

#### Create the AuthController

Start by creating an AuthController that has the `WristbandExpressAuthService` injected into the constructor. You'll also need to import the `WristbandAuthGuard` as well.

```typescript
// src/auth/auth.controller.ts

import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { env } from 'node:process';
import { CallbackResult, WristbandExpressAuthService } from '@wristband/nestjs-auth';
import { WristbandAuthGuard } from '../guards/auth.guard';

// Auth Endpoint route paths can be whatever you prefer
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('WristbandAuth')
    private readonly wristbandAuth: WristbandExpressAuthService,
  ) {}
  
  // Auth endpoints to follow here...
}
```

#### Login Endpoint

The goal of the Login Endpoint is to initiate an auth request by redirecting to the [Wristband Authorization Endpoint](https://docs.wristband.dev/reference/authorizev1). It will store any state tied to the auth request in a Login State Cookie, which will later be used by the Callback Endpoint. The frontend of your application should redirect to this endpoint when users need to log in to your application.


```typescript
// src/auth/auth.controller.ts (continued)

// ...

@Controller('api/auth')
export class AuthController {
  //
  // ...
  //
  
  // Login Endpoint - Route path can be whatever you prefer
  @Get('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const authorizeUrl = await this.wristbandAuth.login(req, res);
    res.redirect(authorizeUrl);
  }
}
```

#### Callback Endpoint

The goal of the Callback Endpoint is to receive incoming calls from Wristband after the user has authenticated and ensure that the Login State cookie contains all auth request state in order to complete the Login Workflow. From there, it will call the [Wristband Token Endpoint](https://docs.wristband.dev/reference/tokenv1) to fetch necessary JWTs, call the [Wristband Userinfo Endpoint](https://docs.wristband.dev/reference/userinfov1) to get the user's data, and create a session for the application containing the JWTs and user data.

```typescript
// src/auth/auth.controller.ts (continued)

// ...

@Controller('api/auth')
export class AuthController {
  //
  // ...
  //
  
  // Callback Endpoint - Route path can be whatever you prefer
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const callbackResult: CallbackResult = await this.wristbandAuth.callback(req, res);
    const { type, callbackData, reason, redirectUrl } = callbackResult;

    if (type === 'redirect_required') {
      // For certain edge cases, the SDK will require you to redirect back to login.
      console.debug(reason); // <- Optional debugging info
      res.redirect(redirectUrl);
      return;
    }

    // Save necessary fields in the user's session.
    req.session.fromCallback(callbackData);
    await req.session.save();

    // Send the user back to the application.
    res.redirect(callbackData.returnUrl || `<your_app_home_url>`);
  }
}
```

#### Logout Endpoint

The goal of the Logout Endpoint is to destroy the application's session that was established during the Callback Endpoint execution. If refresh tokens were requested during the Login Workflow, then a call to the [Wristband Revoke Token Endpoint](https://docs.wristband.dev/reference/revokev1) will occur. It then will redirect to the [Wristband Logout Endpoint](https://docs.wristband.dev/reference/logoutv1) in order to destroy the user's authentication session within the Wristband platform. From there, Wristband will send the user to the Tenant-Level Login Page (unless configured otherwise).

```typescript
// src/auth/auth.controller.ts (continued)

// ...

@Controller('api/auth')
export class AuthController {
  //
  // ...
  //
  
  // Logout Endpoint - Route path can be whatever you prefer
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { refreshToken, tenantName } = req.session;

    // Always destroy the app session.
    req.session.destroy();

    const logoutUrl = await this.wristbandAuth.logout(req, res, { tenantName, refreshToken });
    res.redirect(logoutUrl);
  }
}
```

#### Session Endpoint

> [!NOTE]
> This endpoint is required for Wristband frontend SDKs to function. For more details, see the [Wristband Session Management documentation](https://docs.wristband.dev/docs/session-management-backend-server).

Wristband frontend SDKs require a Session Endpoint in your backend to verify authentication status and retrieve session metadata. Create a protected session endpoint that uses `session.getSessionResponse()` to return the session response format expected by Wristband's frontend SDKs. The response type will always have a `userId` and a `tenantId` in it. You can include any additional data for your frontend by customizing the `metadata` parameter (optional), which requires JSON-serializable values. **The response must not be cached**.

> **⚠️ Important:**
> This endpoint must be protected with the Auth Guard!

```typescript
// src/auth/auth.controller.ts (continued)

// ...

@Controller('api/auth')
export class AuthController {
  //
  // ...
  //

  // Session Endpoint - Route path can be whatever you prefer
  @Get('session')
  @UseGuards(WristbandAuthGuard)
  getSessionResponse(@Req() req: Request, @Res() res: Response): void {
    const sessionResponse = req.session.getSessionResponse();
    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');
    res.status(200).json(sessionResponse);
  }
}
```

The Session Endpoint returns the `SessionResponse` type to your frontend:

```json
{
  "tenantId": "tenant_abc123",
  "userId": "user_xyz789",
  "metadata": {
    "foo": "bar",
    // ...any other optional data you provide...
  }
}
```

#### Token Endpoint (Optional)

> [!NOTE]
> This endpoint is required when your frontend needs to make authenticated API requests directly to Wristband or other protected services. For more details, see the [Wristband documentation on using access tokens from the frontend](https://docs.wristband.dev/docs/authenticating-api-requests-with-bearer-tokens#using-access-tokens-from-the-frontend).
>
> If your application doesn't need frontend access to tokens (e.g., all API calls go through your backend), you can skip this endpoint.

Some applications require the frontend to make direct API calls to Wristband or other protected services using the user's access token. The Token Endpoint provides a secure way for your frontend to retrieve the current access token and its expiration time without exposing it in the session cookie or in browser storage.

Create a protected token endpoint that uses `session.getTokenResponse()` to return the token data expected by Wristband's frontend SDKs. **The response must not be cached**.

> **⚠️ Important:**
> This endpoint must be protected with the Auth Guard!

```typescript
// src/auth/auth.controller.ts (continued)

// ...

@Controller('api/auth')
export class AuthController {
  //
  // ...
  //

  // Token Endpoint - Route path can be whatever you prefer
  @Get('token')
  @UseGuards(WristbandAuthGuard)
  getTokenResponse(@Req() req: Request, @Res() res: Response): void {
    const tokenResponse = req.session.getTokenResponse();
    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');
    res.status(200).json(tokenResponse);
  }
}
```

The Token Endpoint returns the `TokenResponse` type to your frontend:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1735689600000
}
```

Your frontend can then use the `accessToken` in the Authorization header when making API requests:

```typescript
const tokenResponse = await fetch('/auth/token');
const { accessToken } = await tokenResponse.json();

// Use token to call Wristband API
const userResponse = await fetch('https://<your-wristband-app-vanity_domain>/api/v1/users/123', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

<br>

### 5) Create and Inject the AuthModule

Now you will need to create the AuthModule that will encapsulate the AuthController.

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

@Module({ controllers: [AuthController] })
export class AuthModule {}
```

There are multiple ways to handle routing in your NestJS application. The most straightforward approach to making the auth routes available to your application is to import the `AuthModule` directly into your `AppModule`:

```typescript
// src/app.module.ts (continued)

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { env } from 'node:process';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';
import {
  WristbandExpressSessionMiddleware,
  WristbandExpressSessionModule
} from '@wristband/nestjs-auth/session';

import { authConfig, sessionConfig, authGuardConfig } from './config/wristband.config';

// Import the AuthModule
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, sessionConfig, authGuardConfig],
      envFilePath: env.NODE_ENV === 'production' ? '' : '.env',
      ignoreEnvFile: env.NODE_ENV === 'production',
    }),

    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth'),
      inject: [ConfigService],
    }),
    WristbandExpressSessionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandSession'),
      inject: [ConfigService],
    }),

    // Add your AuthModule to the imports
    AuthModule,  // <-- ADD
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WristbandExpressSessionMiddleware).forRoutes('{*splat}');
  }
}
```

<br>

### 6) Protect Your API Routes

You can use the auth guard to protect any route that requires authentication by using the `@UseGuards()` decorator.

The guard automatically:

- ✅ Validates authentication - Checks each auth strategy in order until one succeeds
- ✅ Refreshes expired tokens - When using `SESSION` strategy AND when `refreshToken` and `expiresAt` are present in session (with up to 3 retry attempts)
- ✅ Extends session expiration - Rolling session window on each authenticated request (`SESSION` strategy only)
- ✅ Validates CSRF tokens - Checks CSRF token in request header, if enabled in your session options (`SESSION` strategy only)
- ✅ Returns 401 for unauthenticated requests - Automatically rejects requests that fail all auth strategies

**Route-Level Protection:**

Apply the guard to specific routes when you need fine-grained control over which endpoints require authentication.

```typescript
// src/hello-world/hello-world.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WristbandAuthGuard } from '../guards/auth.guard';

@Controller('api')
export class HelloWorldController {
  // Protect individual routes with @UseGuards()
  @Get('hello-world')
  @UseGuards(WristbandAuthGuard)
  getHelloWorld(@Req() req: Request) {
    return { message: 'Hello World!' };
  }

  // This route remains unprotected
  @Get('public')
  getPublic() {
    return { message: 'Public endpoint' };
  }
}
```

**Controller-Level Protection:**

Apply the guard at the controller level when all routes within that controller require authentication.

```typescript
// src/hello-world/hello-world.controller.ts

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WristbandAuthGuard } from '../guards/auth.guard';

@Controller('api')
@UseGuards(WristbandAuthGuard) // Protects all routes in this controller
export class HelloWorldController {
  @Get('hello-world')
  getHelloWorld(@Req() req: Request) {
    return { message: 'Hello World!' };
  }

  @Get('dashboard')
  getDashboard(@Req() req: Request) {
    return { message: 'Dashboard data' };
  }
}
```

<br>

### 7) Use Your Access Token with APIs

> [!NOTE]
> This section is only applicable if you need to call Wristband APIs or protect your own backend services with Wristband tokens.

If you intend to utilize Wristband APIs within your application or secure any backend APIs or downstream services using the access token provided by Wristband, you must include your access token in the `Authorization` HTTP request header.

```bash
Authorization: Bearer <access_token_value>
```

The access token is available in different ways depending on your authentication strategy.

#### Session-Based Authentication

When using the Session strategy, the access token is stored in `req.session.accessToken`:

```typescript
// src/orders/orders.controller.ts

import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WristbandAuthGuard } from '../guards/auth.guard';
import axios from 'axios';

@Controller('api')
export class OrdersController {
  @Post('orders')
  @UseGuards(WristbandAuthGuard)
  async createOrder(@Req() req: Request, @Body() orderData: any) {
    try {
      const newOrder = { ...orderData };
      db.save(newOrder);
      
      await axios.post('https://api.example.com/email-receipt', newOrder, {
        // Pass your access token to downstream API
        headers: {
          Authorization: `Bearer ${req.session.accessToken}`
        }
      });
      
      return { status: 'created' };
    } catch (error) {
      throw new Error('Internal Server Error');
    }
  }
}
```

#### JWT Bearer Token Authentication

When using the `JWT` auth strategy, the decoded JWT payload is available in `req.auth`, and the raw JWT string is available in `req.auth.jwt`:

```typescript
// src/orders/orders.controller.ts

import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WristbandAuthGuard } from '../guards/auth.guard';
import axios from 'axios';

@Controller('api')
export class OrdersController {
  @Post('orders')
  @UseGuards(WristbandAuthGuard)
  async createOrder(@Req() req: Request, @Body() orderData: any) {
    try {
      const newOrder = { ...orderData };
      db.save(newOrder);
      
      await axios.post('https://api.example.com/email-receipt', newOrder, {
        // Pass your access token to downstream API
        headers: {
          Authorization: `Bearer ${req.auth.jwt}`
        }
      });
      
      return { status: 'created' };
    } catch (error) {
      throw new Error('Internal Server Error');
    }
  }
}
```

#### Using Access Tokens from the Frontend

For scenarios where your frontend needs to make direct API calls with the user's access token, use the [Token Endpoint](#token-endpoint-optional) to securely retrieve the current access token.

<br>

## Wristband Auth Configuration Options

The NestJS SDK provides a dynamic module that wraps the Wristband Express Auth SDK. It accepts an `AuthConfig` type for module configuration, which contains the full set of options for integrating Wristband authentication, including required, optional, and auto-configured values. These configuration values should be stored as environment variables protected in a key vault for production, or placed in a `.env` file for development environments.

| AuthConfig Field | Type | Required | Auto-Configurable | Description |
| ---------------- | ---- | -------- | ----------------- | ----------- |
| autoConfigureEnabled | boolean | No | _N/A_ | Flag that tells the SDK to automatically set some of the SDK configuration values by calling to Wristband's SDK Auto-Configuration Endpoint. Any manually provided configurations will take precedence over the configs returned from the endpoint. Auto-configure is enabled by default. When disabled, if manual configurations are not provided, then an error will be thrown. |
| clientId | string | Yes | No | The ID of the Wristband client. |
| clientSecret | string | Yes | No | The client's secret. |
| customApplicationLoginPageUrl | string | No | Yes | Custom Application-Level Login Page URL (i.e. Tenant Discovery Page URL). This value only needs to be provided if you are self-hosting the application login page. By default, the SDK will use your Wristband-hosted Application-Level Login page URL. If this value is provided, the SDK will redirect to this URL in certain cases where it cannot resolve a proper Tenant-Level Login URL. |
| dangerouslyDisableSecureCookies | boolean | No | No | USE WITH CAUTION: If set to `true`, the "Secure" attribute will not be included in any cookie settings. This should only be done when testing in local development environments that don't have HTTPS enabled.  If not provided, this value defaults to `false`. |
| isApplicationCustomDomainActive | boolean | No | Yes | Indicates whether your Wristband application is configured with an application-level custom domain that is active. This tells the SDK which URL format to use when constructing the Wristband Authorize Endpoint URL. This has no effect on any tenant custom domains passed to your Login Endpoint either via the `tenant_custom_domain` query parameter or via the `defaultTenantCustomDomain` config.  Defaults to `false`. |
| loginStateSecret | string | No | No | A 32 character (or longer) secret used for encryption and decryption of login state cookies. If not provided, it will default to using the client secret. For enhanced security, it is recommended to provide a value that is unique from the client secret. You can run `openssl rand -base64 32` to create a secret from your CLI. |
| loginUrl | string | Yes | Yes | The URL of your application's login endpoint.  This is the endpoint within your application that redirects to Wristband to initialize the login flow. If you intend to use tenant subdomains in your Login Endpoint URL, then this value must contain the `{tenant_domain}` token. For example: `https://{tenant_domain}.yourapp.com/auth/login`. |
| parseTenantFromRootDomain | string | Only if using tenant subdomains in your application | Yes | The root domain for your application. This value only needs to be specified if you intend to use tenant subdomains in your Login and Callback Endpoint URLs.  The root domain should be set to the portion of the domain that comes after the tenant subdomain.  For example, if your application uses tenant subdomains such as `tenantA.yourapp.com` and `tenantB.yourapp.com`, then the root domain should be set to `yourapp.com`. This has no effect on any tenant custom domains passed to your Login Endpoint either via the `tenant_custom_domain` query parameter or via the `defaultTenantCustomDomain` config. When this configuration is enabled, the SDK extracts the tenant subdomain from the host and uses it to construct the Wristband Authorize URL. |
| redirectUri | string | Yes | Yes | The URI that Wristband will redirect to after authenticating a user.  This should point to your application's callback endpoint. If you intend to use tenant subdomains in your Callback Endpoint URL, then this value must contain the `{tenant_domain}` token. For example: `https://{tenant_domain}.yourapp.com/auth/callback`. |
| scopes | string[] | No | No | The scopes required for authentication. Refer to the [UserInfo API docs](https://docs.wristband.dev/reference/userinfov1) for currently supported scopes. The default value is `[openid, offline_access, email]`. |
| tokenExpirationBuffer | number | No | No | Buffer time (in seconds) to subtract from the access token’s expiration time. This causes the token to be treated as expired before its actual expiration, helping to avoid token expiration during API calls. Defaults to 60 seconds. |
| wristbandApplicationVanityDomain | string | Yes | No | The vanity domain of the Wristband application. |

<br>

### WristbandExpressAuthModule and WristbandExpressAuthService

The `WristbandExpressAuthModule` is a dynamic NestJS module that provides the Wristband authentication service. This module is registered globally, making the `WristbandExpressAuthService` provider available for injection across all modules in your application via NestJS's dependency injection system.

It offers flexible configuration through its `forRootAsync()` method (NestJS's standard pattern for async dynamic modules), allowing you to configure the service with custom `AuthConfig` and custom dependency injection tokens, enabling multiple SDK instances in the same application if needed.

**Dynamic Configuration with ConfigService**

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

...

WristbandExpressAuthModule.forRootAsync(
  {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      clientId: configService.get('WRISTBAND_CLIENT_ID'),
      clientSecret: configService.get('WRISTBAND_CLIENT_SECRET'),
      wristbandApplicationVanityDomain: configService.get('WRISTBAND_VANITY_DOMAIN'),
      // ...the rest of the config...
    }),
    inject: [ConfigService],
  },
  // The token name for the instance of the WristbandExpressAuthService provided by this module.
  'WristbandAuth',
);

...
```

**Static Configuration**
```typescript
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

...

WristbandExpressAuthModule.forRootAsync(
  {
    useFactory: () => ({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      wristbandApplicationVanityDomain: 'auth.yourapp.com',
      // ...the rest of the config...
    }),
  },
  // The token name for the instance of the WristbandExpressAuthService provided by this module.
  'WristbandAuth',
);

...
```

**Service Injection**

When you provide a token name when calling `forRootAsync()`, you can inject the service like the following:

```typescript
import { Controller, Inject } from '@nestjs/common';
import { WristbandExpressAuthService } from '@wristband/nestjs-auth';

...

@Controller('api/auth')
export class AuthController {
  constructor(
    // Provide the token name to the Inject decorator
    @Inject('WristbandAuth')
    private readonly wristbandAuth: WristbandExpressAuthService,
  ) {}
  
  // ...Methods...
}

...
```

**Multi-Instance Setup**

For applications requiring multiple Wristband configurations, you can configure multiple instances:

```typescript
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

@Module({
  imports: [
    // Instance 01 configuration
    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth01'),
      inject: [ConfigService],
    }, 'WristbandAuth01'),
    
    // Instance 02 configuration
    WristbandExpressAuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('wristbandAuth02'),
      inject: [ConfigService],
    }, 'WristbandAuth02'),
  ],
})
export class AppModule {}
```

Then inject the specific instances you need:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WristbandExpressAuthService } from '@wristband/nestjs-auth';

@Injectable()
export class HelloWorldService {
  constructor(
    @Inject('WristbandAuth01')
    private readonly wristbandAuth01: WristbandExpressAuthService,
    @Inject('WristbandAuth02')
    private readonly wristbandAuth02: WristbandExpressAuthService,
  ) {}
  
  // ...Methods...
}
```

<br>

### SDK Auto-Configuration

Under the hood, `WristbandExpressAuthService` relies on the Express Auth function `createWristbandAuth()` for SDK initialization, and uses lazy auto-configuration by default. Auto-configuration will fetch any missing configuration values from the Wristband SDK Configuration Endpoint when any auth function is first called (i.e. `login`, `callback`, etc.). Set `autoConfigureEnabled` to `false` disable to prevent the SDK from making an API request to the Wristband SDK Configuration Endpoint. In the event auto-configuration is disabled, you must manually configure all required values. Manual configuration values take precedence over auto-configured values.

**Minimal config with auto-configure (default behavior)**

```ts
WristbandExpressAuthModule.forRootAsync(
  {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      clientId: "your-client-id",
      clientSecret: "your-client-secret",
      wristbandApplicationVanityDomain: "your-wb-app-vanity-domain",
    }),
    inject: [ConfigService],
  },
  'WristbandAuth',
);
```

**Manual override with partial auto-configure for some fields**

```ts
WristbandExpressAuthModule.forRootAsync(
  {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      clientId: "your-client-id",
      clientSecret: "your-client-secret",
      wristbandApplicationVanityDomain: "auth.yourapp.io",
      loginUrl: "https://yourapp.io/auth/login", // Manually override "loginUrl"
      // "redirectUri" will be auto-configured
    }),
    inject: [ConfigService],
  },
  'WristbandAuth',
);
```

**Auto-configure disabled**
```ts
WristbandExpressAuthModule.forRootAsync(
  {
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      autoConfigureEnabled: false,
      clientId: "your-client-id",
      clientSecret: "your-client-secret",
      wristbandApplicationVanityDomain: "auth.custom.com",
      // Must manually configure non-auto-configurable fields
      isApplicationCustomDomainActive: true,
      loginUrl: "https://{tenant_domain}.custom.com/auth/login",
      redirectUri: "https://{tenant_domain}.custom.com/auth/callback",
      parseTenantFromRootDomain: "custom.com",
    }),
    inject: [ConfigService],
  },
  'WristbandAuth',
);
```

<br/>

## Auth API

This SDK uses the [Wristband express-auth SDK](https://github.com/wristband-dev/express-auth) internally for all Express support. The following auth methods are available via the `WristbandExpressAuthService`. For detailed documentation on parameters, return types, and behavior, refer to the express-auth Auth API documentation:

- <ins>[login()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#login)</ins>
- <ins>[callback()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#callback)</ins>
- <ins>[logout()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#logout)</ins>
- <ins>[refreshTokenIfExpired()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#refreshtokenifexpired)</ins>

<br>

---

<br>

## Session Management

The SDK provides encrypted cookie-based session management via `WristbandExpressSessionModule` and `WristbandExpressSessionMiddleware`. Sessions are automatically attached to `req.session` on every request and provide both dictionary-style and attribute-style access for storing user data. All session data is encrypted using AES-256-GCM before being stored in a session cookie.

> **📚 Learn More About Sessions**
>
> This section covers NestJS-specific session setup and usage. For detailed information on session configuration options, session object methods, and advanced patterns like key rotation, see the [express-auth Session Management documentation](https://github.com/wristband-dev/express-auth#session-management).

### WristbandExpressSessionModule

The `WristbandExpressSessionModule` is a dynamic NestJS module that provides session management. Configure the module using `forRootAsync()`:

```typescript
// src/app.module.ts

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { 
  WristbandExpressSessionModule,
  WristbandExpressSessionMiddleware 
} from '@wristband/nestjs-auth/session';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WristbandExpressSessionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secrets: 'random-32-char-secret-value',
        maxAge: 3600,
        secure: true,
        enableCsrfProtection: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WristbandExpressSessionMiddleware)
      .forRoutes('{*splat}');
  }
}
```

**Static configuration:**

```typescript
WristbandExpressSessionModule.forRootAsync({
  useFactory: () => ({
    secrets: 'random-32-char-secret-value',
    maxAge: 3600,
    secure: false, // Only for development
  }),
});
```

### Session Configuration

| Parameter | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |
| secrets | string or string[] | Yes | N/A | Secret key(s) for session encryption (minimum 32 characters). Can be a single string or array of strings for key rotation. You can run `openssl rand -base64 32` on your CLI to generate a secret. |
| cookieName | string | No | `session` | Name of the session cookie. |
| domain | string | No | `undefined` (cookie only sent to current domain) | Domain for the session cookie. |
| maxAge | number | No | 3600 (1 hour) | Cookie expiration time in seconds. |
| path | string | No | "/" | Cookie path. |
| sameSite | `Lax` or `Strict` or `None` | No | `Lax` | Cookie SameSite attribute. |
| secure | boolean | No | true | Require HTTPS for cookies. **Set `secure: true` in production to ensure cookies are only sent over HTTPS.** |
| enableCsrfProtection | boolean | No | false | When enabled, a CSRF token is automatically generated after authentication (via `session.save()`) and is stored in the session. A separate CSRF cookie is also set in addition to the session cookie. |
| csrfCookieName | string | No | `CSRF-TOKEN` | Name of the CSRF cookie. |
| csrfCookieDomain | string | No | `undefined` (defaults to `domain` value) | Domain for CSRF cookie. |

For full details on session configuration options, see the [@wristband/typescript-session](https://github.com/wristband-dev/typescript-session?tab=readme-ov-file#sessionoptions) documentation.

### The Session Object

Once the session middleware is configured, every request automatically has a session object attached at `req.session`. You can access session data using both dictionary-style access (`req.session['key']`) and attribute-style access (`req.session.key`).

#### Base Session Fields

These fields are automatically populated when you call `req.session.fromCallback()` after successful Wristband authentication:

| SessionData Field | Type | Description |
| ----------------- | ---- | ----------- |
| isAuthenticated | boolean or `undefined` | Whether the user is authenticated (set to `true` by `fromCallback()`). |
| accessToken | string or `undefined` | JWT access token for making authenticated API calls. |
| expiresAt | number or `undefined` | Token expiration timestamp (milliseconds since Unix epoch). |
| userId | string or `undefined` | Unique identifier for the authenticated user. |
| tenantId | string or `undefined` | Unique identifier for the tenant that the user belongs to. |
| tenantName | string or `undefined` | Name of the tenant that the user belongs to. |
| identityProviderName | string or `undefined` | Name of the identity provider that the user belongs to. |
| refreshToken | string or `undefined` | Refresh token for obtaining new access tokens (only if `offline_access` scope requested). |
| tenantCustomDomain | string or `undefined` | Custom domain for the tenant, if configured. |

#### Extending SessionData

Add custom fields with TypeScript declaration merging:

```typescript
// src/types/session-data.d.ts
import '@wristband/typescript-session';

/**
 * Augment SessionData with custom application-specific fields.
 * All custom fields should be optional since they may not be present in all session states.
 */
declare module '@wristband/typescript-session' {
  interface SessionData {
    theme?: string;
    lastLogin?: number;
  }
}
```

Then use with full type safety:

```typescript
@Post('settings')
@UseGuards(WristbandAuthGuard)
async updateSettings(@Req() req: Request) {
  req.session.theme = 'dark';          // ✅ Type-safe
  req.session.lastLogin = Date.now();  // ✅ Type-safe
  await req.session.save();
}
```

### Session API

#### session.fromCallback()

```typescript
fromCallback(callbackData: CallbackData, customFields?: Record<string, any>): void;
```

Create a session from Wristband callback data after successful authentication.
```typescript
const callbackResult = await this.wristbandAuth.callback(req, res);

// Basic usage
req.session.fromCallback(callbackResult.callbackData!);

// With custom fields
req.session.fromCallback(callbackResult.callbackData!, {
  preferences: { theme: 'dark' },
  lastLogin: Date.now()
});
```

#### session.save()

Mark the session for persistence. Refreshes cookie expiration (rolling sessions) and saves modifications.
```typescript
req.session.lastActivity = Date.now();
await req.session.save();
```

#### session.destroy()

Delete the session and clear all cookies (both session and CSRF).
```typescript
@Get('logout')
async logout(@Req() req: Request, @Res() res: Response) {
  const { refreshToken, tenantName } = req.session;
  req.session.destroy();
  const logoutUrl = await this.wristbandAuth.logout(req, res, { tenantName, refreshToken });
  res.redirect(logoutUrl);
}
```

#### session.getSessionResponse()

```typescript
getSessionResponse(metadata?: Record<string, any>): SessionResponse;
```

Create a `SessionResponse` for Wristband frontend SDKs.
```typescript
@Get('session')
@UseGuards(WristbandAuthGuard)
getSessionResponse(@Req() req: Request, @Res() res: Response) {
  const sessionResponse = req.session.getSessionResponse({ foo: 'bar' });
  res.header('Cache-Control', 'no-store');
  res.status(200).json(sessionResponse);
}
```

#### session.getTokenResponse()

```typescript
getTokenResponse(): TokenResponse;
```

Create a `TokenResponse` for Wristband frontend SDKs.
```typescript
@Get('token')
@UseGuards(WristbandAuthGuard)
getTokenResponse(@Req() req: Request, @Res() res: Response) {
  const tokenResponse = req.session.getTokenResponse();
  res.header('Cache-Control', 'no-store');
  res.status(200).json(tokenResponse);
}
```

### CSRF Protection

CSRF (Cross-Site Request Forgery) protection helps prevent unauthorized actions by validating that requests originate from your application's frontend. When enabled, the SDK implements the [Synchronizer Token Pattern](https://docs.wristband.dev/docs/csrf-protection-for-backend-servers) using a dual-cookie approach.

#### Enabling CSRF Protection

Configure CSRF in your session options:

```typescript
// src/config/wristband.config.ts
const sessionOptions: SessionOptions = {
  secrets: 'your-secret-key-min-32-chars',
  maxAge: 3600,
  enableCsrfProtection: true,  // Enable CSRF protection
};

export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['SESSION'],
  sessionConfig: {
    sessionOptions,
    csrfTokenHeaderName: 'x-csrf-token',  // Optional: custom header name
  },
}));
```

#### Frontend Implementation

Your frontend must read the CSRF token from the CSRF cookie and include it in request headers:

```typescript
// Read CSRF token from cookie
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('CSRF-TOKEN='))
  ?.split('=')[1];

// Include in requests
fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-TOKEN': csrfToken,
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({ data: 'example' })
});
```

<br>

---

<br>

## Authentication Guard

The SDK provides an authentication guard via the `createWristbandAuthGuard()` factory function that protects routes with support for multiple authentication strategies including session-based and JWT bearer token authentication.

> **📚 Learn More About Authentication**
>
> This section covers NestJS-specific guard setup and usage. For detailed information on authentication strategy behavior, token refresh logic, and CSRF validation implementation, see the [express-auth Authentication Middleware documentation](https://github.com/wristband-dev/express-auth#authentication-middleware).

### createWristbandAuthGuard()

```typescript
function createWristbandAuthGuard(
  configKey?: string,
  authToken?: string
): Type;
```

Creates a guard for protecting NestJS routes. This guard supports multiple authentication strategies and automatically handles session validation, token refresh, and optional CSRF protection.

| Parameter | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |
| configKey | string | No | `'wristbandAuthGuard'` | The `ConfigModule` key to read guard configuration from. |
| authToken | string | No | `'WristbandAuth'` | The DI token for the `WristbandExpressAuthService` instance. |

#### Basic Usage

Create a guard instance:

```typescript
// src/guards/auth.guard.ts
import { createWristbandAuthGuard } from '@wristband/nestjs-auth';

export const WristbandAuthGuard = createWristbandAuthGuard();
```

Configure the guard:

```typescript
// src/config/wristband.config.ts
export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['SESSION'],
  sessionConfig: {
    sessionOptions: {
      secrets: process.env.SESSION_SECRET!,
      maxAge: 3600,
      secure: true,
    },
  },
}));
```

Apply to routes:
```typescript
@Get('orders')
@UseGuards(WristbandAuthGuard)
getOrders() {
  return { orders: [] };
}
```

#### Custom Configuration Keys

For multi-instance setups:

```typescript
// src/guards/admin-auth.guard.ts
export const AdminAuthGuard = createWristbandAuthGuard(
  'adminAuthGuard',    // Custom config key
  'AdminWristbandAuth' // Custom service token
);
```

Configure separately:

```typescript
// src/config/wristband.config.ts
export const adminAuthGuardConfig = registerAs('adminAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['JWT'],
  jwtConfig: {
    jwksCacheMaxSize: 50,
  },
}));
```

### Guard Configuration

```typescript
// Example: All configuration options
export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['JWT', 'SESSION'],

  sessionConfig: {
    sessionOptions: {
      cookieName: 'session',
      secrets: process.env.SESSION_SECRET!,
      maxAge: 3600,
      domain: '.example.com',
      path: '/',
      secure: true,
      sameSite: 'lax',
      enableCsrfProtection: true,
      csrfCookieName: 'CSRF-TOKEN',
      csrfCookieDomain: '.example.com',
    },
    csrfTokenHeaderName: 'x-custom-csrf',
  },

  jwtConfig: {
    jwksCacheMaxSize: 25,
    jwksCacheTtl: 3600000,
  },
}));
```

| AuthGuardConfig | Type | Required | Description |
| --------------- | ---- | -------- | ----------- |
| authStrategies | `AuthStrategy[]` | Yes | Authentication strategies to try in order: `'SESSION'`, `'JWT'`, or both. The guard tries each strategy until one succeeds. |
| sessionConfig | object | Required if using `'SESSION'` | Session configuration including session options and CSRF settings. |
| jwtConfig | object | No | JWT configuration for JWKS caching (only needed with `'JWT'` strategy). |

### Authentication Strategies

#### SESSION Strategy

Validates authentication using encrypted session cookies. The guard:

1. Validates session cookie (`session.isAuthenticated === true`)
2. Refreshes expired tokens (if `refreshToken` and `expiresAt` present)
3. Validates CSRF tokens (if enabled)
4. Extends session expiration (rolling sessions)
5. Saves session changes

**Configuration:**

| SessionConfig | Type | Required | Default | Description |
| ------------- | ---- | -------- | ------- | ----------- |
| sessionOptions | `SessionOptions` | Yes | N/A | Core session configuration (same as session middleware). See [Session Configuration](#session-configuration). |
| csrfTokenHeaderName | string | No | `x-csrf-token` | HTTP header name for CSRF token (if CSRF enabled). |

**Example:**
```typescript
export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['SESSION'],
  sessionConfig: {
    sessionOptions: {
      secrets: process.env.SESSION_SECRET!,
      maxAge: 3600,
      secure: true,
      enableCsrfProtection: true,
    },
    csrfTokenHeaderName: 'x-csrf-token',
  },
}));
```

#### JWT Strategy

Validates JWT bearer tokens from the `Authorization: Bearer <token>` header. The guard:

1. Extracts JWT token from Authorization header
2. Verifies signature using cached JWKS
3. Validates claims (expiration, issuer, etc.)
4. Populates `req.auth` with JWT payload and raw token
5. No session management (stateless)

After successful JWT authentication:
```typescript
@Get('orders')
@UseGuards(WristbandAuthGuard)
getOrders(@Req() req: Request) {
  const userId = req.auth.sub;      // JWT claims
  const bearerToken = req.auth.jwt; // Raw token
  return { orders: [], userId };
}
```

**Configuration:**

| JwtConfig | Type | Required | Default | Description |
| --------- | ---- | -------- | ------- | ----------- |
| jwksCacheMaxSize | number | No | 20 | Maximum JWKs to cache (LRU eviction). |
| jwksCacheTtl | number | No | `undefined` | JWK cache TTL in milliseconds. |

**Example:**
```typescript
export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['JWT'],
  jwtConfig: {
    jwksCacheMaxSize: 50,
    jwksCacheTtl: 600000, // 10 minutes
  },
}));
```

**TypeScript Support:**

To enable type-safe access to `req.auth` without optional chaining, import the JWT type augmentation in your Wristband configuration file:

```typescript
// src/config/wristband.config.ts

import { registerAs } from '@nestjs/config';
import type { AuthConfig, AuthGuardConfig } from '@wristband/nestjs-auth';

// This import augments the Express Request type with req.auth typing
import '@wristband/nestjs-auth/jwt';

export const authConfig = registerAs('wristbandAuth', (): AuthConfig => ({
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  wristbandApplicationVanityDomain: process.env.APPLICATION_VANITY_DOMAIN!,
}));

export const authGuardConfig = registerAs('wristbandAuthGuard', (): AuthGuardConfig => ({
  authStrategies: ['JWT'],
  jwtConfig: {
    jwksCacheMaxSize: 50,
  },
}));
```

Once imported, `req.auth` is fully typed in your controllers:

```typescript
@Get('data')
@UseGuards(WristbandAuthGuard)
getData(@Req() req: Request) {
  const userId = req.auth.sub;      // ✅ Fully typed, no optional chaining needed
  const bearerToken = req.auth.jwt; // ✅ Fully typed
  return { userId };
}
```

Without the import, you'd need optional chaining (e.g., `req.auth?.sub`).

#### Strategy Order

When multiple strategies are configured, they're tried in order:
```typescript
// Try JWT first, fall back to SESSION
authStrategies: ['JWT', 'SESSION']

// Support both session-based and API clients
authStrategies: ['SESSION', 'JWT']
```

If all strategies fail, returns HTTP 401.

### Using the Guard

**Route-level:**
```typescript
@Get('orders')
@UseGuards(WristbandAuthGuard)
getOrders() {
  return { orders: [] };
}
```

**Controller-level:**
```typescript
@Controller('api')
@UseGuards(WristbandAuthGuard)
export class ProtectedController {
  // All routes protected
}
```

### Guard Error Handling

The guard throws NestJS exceptions:

- **401 Unauthorized** - Authentication failed or token refresh failed
- **403 Forbidden** - CSRF validation failed (SESSION with CSRF enabled)
- **500 Internal Server Error** - Unexpected error

Handle on the frontend:
```typescript
const response = await fetch(url, {
  credentials: 'include',
  headers: { 'X-CSRF-TOKEN': getCsrfToken() },
});

if (response.status === 401 || response.status === 403) {
  window.location.href = '/api/auth/login';
}
```

<br>

---

<br>

## Related Wristband SDKs

This SDK builds upon and integrates with other Wristband SDKs to provide a complete authentication solution:

**[@wristband/express-auth](https://github.com/wristband-dev/express-auth)**

This SDK wraps the Wristband Express Auth SDK to provide NestJS-specific patterns and integrations. The express-auth SDK provides all core authentication functionality including login workflows, callback handling, logout flows, token refresh, session management (via [@wristband/typescript-session](https://github.com/wristband-dev/typescript-session)), and JWT validation (via [@wristband/typescript-jwt](https://github.com/wristband-dev/typescript-jwt)). This NestJS SDK adapts those capabilities for use with NestJS modules, guards, and dependency injection. Refer to the express-auth repository for detailed documentation on auth configuration options, API methods, and authentication workflows.

**[@wristband/typescript-session](https://github.com/wristband-dev/typescript-session)**

Included as a dependency via express-auth, this SDK provides encrypted cookie-based session management. It provides the underlying session infrastructure including encryption, cookie handling, and session lifecycle management. Refer to that GitHub repository for more information on session configuration options and advanced usage.

**[@wristband/typescript-jwt](https://github.com/wristband-dev/typescript-jwt)**

Included as a dependency via express-auth, this SDK handles JWT validation when using the `JWT` authentication strategy in guards. It handles JWT signature verification, token parsing, and JWKS key management. The JWT SDK functions are also re-exported from this package, allowing you to use them directly for custom JWT validation scenarios beyond the built-in guard strategy. Refer to that GitHub repository for more information on JWT validation configuration and options.

**[@wristband/react-client-auth](https://github.com/wristband-dev/react-client-auth)**

For handling client-side authentication and session management in your React frontend, check out the Wristband React Client Auth SDK. It integrates seamlessly with this backend SDK by consuming the Session and Token endpoints you create. Refer to that GitHub repository for more information on frontend authentication patterns.

<br>

## Wristband Multi-Tenant NestJS Demo App

You can check out the [Wristband NestJS demo app](https://github.com/wristband-dev/nestjs-demo-app) to see this SDK in action. Refer to that GitHub repository for more information.

<br>

## Questions

Reach out to the Wristband team at <support@wristband.dev> for any questions regarding this SDK.

<br>
