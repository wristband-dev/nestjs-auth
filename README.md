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

This module facilitates seamless interaction with Wristband for user authentication within multi-tenant [NestJS applications](https://nestjs.com). It follows OAuth 2.1 and OpenID standards. It supports both CommonJS and ES Modules and includes TypeScript declaration files.

Key functionalities encompass the following:

- Initiating a login request by redirecting to Wristband.
- Receiving callback requests from Wristband to complete a login request.
- Retrieving all necessary JWT tokens and userinfo to start an application session.
- Logging out a user from the application by revoking refresh tokens and redirecting to Wristband.
- Checking for expired access tokens and refreshing them automatically, if necessary.

You can learn more about how authentication works in Wristband in our documentation:

- [Auth Flows Walkthrough](https://docs.wristband.dev/docs/auth-flows-and-diagrams)
- [Login Workflow In Depth](https://docs.wristband.dev/docs/login-workflow)

---

## Installation

> [!WARNING]
> This SDK currently only supports the Express framework. Reach out to the Wristband team if you are looking for Fastify support.

```sh
npm install @wristband/nestjs-auth
```

or 

```sh
yarn add @wristband/nestjs-auth
```

## Usage

The following steps will provide the suggested usage for this SDK, though you can certainly adjust as your project dictates.

### 1) Import the Wristband SDK in your AppModule.

First, import the `WristbandExpressAuthModule` from the SDK and add it to the list of module imports in your AppModule (i.e. `src/app.module.ts`). In doing so, you will actually create an instance of the Wristband providers to be used globally by any module in your project. You must provide all necessary configurations for your Wristband application that correlates with how you've configured it in the Wristband Dashboard.

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import { env } from 'node:process';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

import { HelloWorldModule } from './hello-world/hello-world.module';

@Module({
  imports: [
    // Add the ConfigModule to access .env files
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: () => {
        // Provide the env path resolution that is appropriate for your project.
        return env.NODE_ENV === 'production' ? '' : '.env.local';
      },
    }),

    // Add any project-specific modules that contain your core business logic.
    HelloWorldModule,

    // Add the Wristband NestJS Auth SDK with your Wristband configurations.
    // Configs can live in an external file and source values from your .env.
    WristbandExpressAuthModule.forRoot({
      clientId: "ic6saso5hzdvbnof3bwgccejxy",
      clientSecret: "30e9977124b13037d035be10d727806f",
      loginStateSecret: '7ffdbecc-ab7d-4134-9307-2dfcc52f7475',
      loginUrl: "https://{tenant_domain}.yourapp.io/auth/login",
      redirectUri: "https://{tenant_domain}.yourapp.io/auth/callback",
      rootDomain: "yourapp.io",
      useCustomDomains: true,
      useTenantSubdomains: true,
      wristbandApplicationDomain: "auth.yourapp.io",
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Add any middlewares needed by your project
  }
}
```

### 2) Choose Your Session Storage

This Wristband authentication SDK is unopinionated about how you store and manage your application session data after the user has authenticated. We typically recommend cookie-based sessions due to it being lighter-weight and not requiring a backend session store like Redis or other technologies.  We are big fans of <ins>[Iron Session](https://github.com/vvo/iron-session)</ins> for this reason. Examples below show what it might look like when using such a library to manage your application's session data.

> [!NOTE]
> <ins>[Express Session](https://github.com/expressjs/session)</ins> is typically the choice for Express-based NestJS applications that need server-side sessions. Refer to the [NestJS docs](https://docs.nestjs.com/techniques/session#use-with-express-default) for how to configure it should you choose that option.

Here's an example of how one might add Iron Session to NestJS. First, create a middleware that can be imported in your AppModule:

```typescript
// src/middleware/iron-session.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getIronSession, SessionOptions } from 'iron-session';
import { NextFunction, Request, Response } from 'express';

// Initializes Iron Session cookie-based sessions for the application.
const ironSession = (sessionOptions: SessionOptions) => {
  return async function ironSessionMiddleware(req: Request, res: Response) {
    req.session = await getIronSession(req, res, sessionOptions);
  };
};

@Injectable()
export class IronSessionMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {
    // Typically, it's best practice to source the values below from your .env file and inject them into this constructor.
  }

  async use(req: Request, res: Response, next: NextFunction) {
    await ironSession({
      cookieName: 'my-session-cookie-name',
      password: '983hr8f9rbgu9bfi9ewbefd8ewhf89ew',
      cookieOptions: {
        httpOnly: true,
        maxAge: 3600,
        path: '/',
        sameSite: true,
        secure: true,
      },
    })(req, res);

    return next();
  }
}
```

Then, add this middleware to your AppModule:

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import { env } from 'node:process';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

import { HelloWorldModule } from './hello-world/hello-world.module';
import { IronSessionMiddleware } from './middleware/iron-session.middleware';

...
...

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Configure the middleware for your app.
    consumer.apply(IronSessionMiddleware).forRoutes('*');
  }
}
```

Now your application can access the session via the `req.session` object.


### 3) Create an Auth Module containing your Wristband Auth Endpoints

There are <ins>three core API endpoints</ins> your NestJS server should expose to facilitate both the Login and Logout workflows in Wristband. It is recommended to create a module that contains the routes/controllers for these endpoints.

#### Create the AuthController

Start by creating an AuthController that has the `WristbandExpressAuthService` injected into the constructor:

```typescript
// src/auth/auth.controller.ts
import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { env } from 'node:process';
import { Request, Response } from 'express';
import {
  CallbackResult,
  CallbackResultType,
  WristbandExpressAuthService,
} from '@wristband/nestjs-auth';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    @Inject()
    private readonly wristbandAuth: WristbandExpressAuthService,
  ) {}
  
  // Auth controllers go here...
}
```

#### [Login Endpoint](https://docs.wristband.dev/docs/auth-flows-and-diagrams#login-endpoint)

The goal of the Login Endpoint is to initiate an auth request by redircting to the [Wristband Authorization Endpoint](https://docs.wristband.dev/reference/authorizev1). It will store any state tied to the auth request in a Login State Cookie, which will later be used by the Callback Endpoint. The frontend of your application should redirect to this endpoint when users need to log in to your application.


```typescript
// src/auth/auth.controller.ts
import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { env } from 'node:process';
import { Request, Response } from 'express';
import {
  CallbackResult,
  CallbackResultType,
  WristbandExpressAuthService,
} from '@wristband/nestjs-auth';

@Controller('api/v1/auth')
export class AuthController {
  ...
  ...
  
  // Add the Login Endpoint 
  @Get('login')
  async login(@Req() req: Request, @Res() res: Response) {
    return await this.wristbandAuth.login(req, res, , { /* Optional login configs */ });
  }
}
```

#### [Callback Endpoint](https://wristband.stoplight.io/docs/documentation/gw47leh3pqplp-auth-flow-walkthrough#callback-endpoint)

The goal of the Callback Endpoint is to receive incoming calls from Wristband after the user has authenticated and ensure that the Login State cookie contains all auth request state in order to complete the Login Workflow. From there, it will call the [Wristband Token Endpoint](https://wristband.stoplight.io/docs/documentation/4b10b301cb6a2-create-tokens) to fetch necessary JWTs, call the [Wristband Userinfo Endpoint](https://wristband.stoplight.io/docs/documentation/78a780487515f-get-current-user-info) to get the user's data, and create a session for the application containing the JWTs and user data.

```typescript
// src/auth/auth.controller.ts
import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { env } from 'node:process';
import { Request, Response } from 'express';
import {
  CallbackResult,
  CallbackResultType,
  WristbandExpressAuthService,
} from '@wristband/nestjs-auth';

@Controller('api/v1/auth')
export class AuthController {
  ...
  ...
  
  // Add the Callback Endpoint 
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const callbackResult: CallbackResult = await this.wristbandAuth.callback(req, res);
      const { result, callbackData } = callbackResult;

      if (result === CallbackResultType.REDIRECT_REQUIRED) {
        // The SDK will have already invoked the redirect() function, so we just stop execution here.
        return;
      }

    // If the SDK does not need to return a redirect response, then we can save any necessary fields for the user's app session into a session cookie.
    // Store a simple flag to indicate the user has successfully authenticated.
      req.session.isAuthenticated = true;
      req.session.accessToken = callbackData.accessToken;
      // Convert the "expiresIn" seconds into a Unix timestamp in milliseconds at which the token expires.
      req.session.expiresAt = Date.now() + callbackData.expiresIn * 1000;
      req.session.refreshToken = callbackData.refreshToken;
      req.session.userId = callbackData.userinfo.sub;
      req.session.tenantId = callbackData.userinfo.tnt_id;
      req.session.identityProviderName = callbackData.userinfo.idp_name;
      req.session.tenantDomainName = callbackData.tenantDomainName;

      await req.session.save();

      // Send the user back to the application.
      return res.redirect(callbackData.returnUrl || `https://${callbackData.tenantDomainName}.yourapp.io/`);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'An error occurred during the process.' });
    }
  }
}
```

#### [Logout Endpoint](https://wristband.stoplight.io/docs/documentation/gw47leh3pqplp-auth-flow-walkthrough#logout-endpoint-1)

The goal of the Logout Endpoint is to destroy the application's session that was established during the Callback Endpoint execution. If refresh tokens were requested during the Login Workflow, then a call to the [Wristband Revoke Token Endpoint](https://wristband.stoplight.io/docs/documentation/1ccf374c99c5b-revoke-token) will occur. It then will redirect to the [Wristband Logout Endpoint](https://wristband.stoplight.io/docs/documentation/ed96d1c4e6a80-logout) in order to destroy the user's authentication session within the Wristband platform. From there, Wristband will send the user to the Tenant-Level Login Page (unless configured otherwise).

```typescript
// src/auth/auth.controller.ts
import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { env } from 'node:process';
import { Request, Response } from 'express';
import {
  CallbackResult,
  CallbackResultType,
  WristbandExpressAuthService,
} from '@wristband/nestjs-auth';

@Controller('api/v1/auth')
export class AuthController {
  ...
  ...
  
  // Add the Logout Endpoint 
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { session } = req;
    const { refreshToken, tenantDomainName } = session;

    res.clearCookie('your_session_cookie_name');
    session.destroy();

    try {
      return await this.wristbandAuth.logout(req, res, {
        refreshToken,
        tenantDomainName,
        redirectUrl: env.GOVERNANCE_HOME_URL,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'An error occurred during the process.' });
    }
  }
}
```

#### Create the AuthModule and import it in AppModule

Now you will need to create the AuthModule that will encapsulate the AuthController.

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

@Module({ controllers: [AuthController] })
export class AuthModule {}
```

There are multiple ways to handle routing in your NestJS application. The most straightforward approach to making the auth routes available to your application is to import the AuthModule directly into your AppModule:


```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import { env } from 'node:process';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

import { HelloWorldModule } from './hello-world/hello-world.module';
import { IronSessionMiddleware } from './middleware/iron-session.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Add the ConfigModule to access .env files
    ConfigModule.forRoot({
	  // .env configs...
    }),

    // Add any project-specific modules that contain your core business logic.
    HelloWorldModule,

    // Add the Wristband NestJS Auth SDK with your Wristband configurations.
    WristbandExpressAuthModule.forRoot({
		// Wristband SDK configs...
    }),
    
    // Add the AuthModule for handling the main auth integration endpoints with Wristband.
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middlewares...
  }
}
```

### 4) Guard Your Non-Auth APIs and Handle Token Refresh

> [!NOTE]
> There may be applications that do not want to utilize access tokens and/or refresh tokens. If that applies to your application, then you can ignore using the `refreshTokenIfExpired()` functionality.

Create a middleware in your project to check that your session is still valid. It must check if the access token is expired and perform a token refresh if necessary. The Wristband SDK will make 3 attempts to refresh the token and return the latest JWTs to your server.

```typescript
// src/middleware/auth.middleware.ts
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WristbandExpressAuthService } from '@wristband/nestjs-auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(WristbandExpressAuthService)
    private readonly wristbandAuth: WristbandExpressAuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.session) {
      return res.status(401).send();
    }

    const { expiresAt, isAuthenticated, refreshToken } =
      req.session;

    if (!isAuthenticated) {
      return res.status(401).send();
    }

    try {
      const tokenData = await this.wristbandAuth.refreshTokenIfExpired(
        refreshToken,
        expiresAt,
      );
      if (tokenData) {
        req.session.accessToken = tokenData.accessToken;
        // Converts the "expiresIn" seconds into a Unix timestamp in milliseconds at which the token expires.
        req.session.expiresAt = Date.now() + tokenData.expiresIn * 1000;
        req.session.refreshToken = tokenData.refreshToken;
      }
      // Save the session in order to "touch" it (even if there is no new token data).
      await req.session.save();
      return next();
    } catch (error) {
      console.error('Auth Middleware Error: ', error);
      return res.status(401).send();
    }
  }
}
```

Then, add this middleware to your AppModule, and make sure to exclude any auth endpoints (your routes in AuthController should allowed to be reached in an unauthenticated state:

```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import { env } from 'node:process';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WristbandExpressAuthModule } from '@wristband/nestjs-auth';

import { AuthModule } from './auth/auth.module';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { IronSessionMiddleware } from './middleware/iron-session.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';

...
...

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IronSessionMiddleware).forRoutes('*');
    // Perform auth/session validation and token refresh for non-auth routes.
    consumer.apply(AuthMiddleware).exclude('/api/v1/auth/(.*)').forRoutes('*');
  }
}
```

You could alternatively leverage [NestJS's Guards](https://docs.nestjs.com/guards#guards) to perform a basic check on the validity of a session, ensuring the user is authenticated before allowing further execution. However, guards should not be responsible for modifying or persisting state, such as refreshing tokens or updating session data -— those responsibilities belong to middleware. The best approach is to use middleware for managing session state (e.g. refreshing tokens or saving updated session data) while using guards to validate the session’s authenticity and access control before allowing requests to proceed. However, if your middleware already handles session validity checks, introducing an auth guard may be redundant, as the middleware itself can ensure that only authenticated requests pass through.


### 5) Pass Your Access Token to Downstream APIs

> [!NOTE]
> This is only applicable if you wish to call Wristband's APIs directly or protect your application's other downstream backend APIs.

If you intend to utilize Wristband APIs within your application or secure any backend APIs or downstream services using the access token provided by Wristband, you must include this token in the `Authorization` HTTP request header.

```
Authorization: Bearer <access_token_value>
```

For example, if you were using Axios to make API calls to other services, you would pass the access token from your application session into the `Authorization` header as follows:

```typescript
// src/hello-world/hello-world.controller.ts
import { Controller, Get, Req, Res, Next } from '@nestjs/common';

// You could pull this function into a utils file and use it across your project.
const bearerToken = function(req) {
  return { headers: { Authorization: `Bearer ${req.session.accessToken}` } };
};

// Fictional example + pseudocode
@Controller('api/v1/hello-world')
export class HelloWorldController {
  @Get()
  getHelloWorld(@Req() req, @Res() res, @Next() next): string {
    try {
      // Pass your access token in the request to downstream APIs
      await this.fakeAnalyticsRestApi.recordHelloTime({ date: Date.now() }, bearerToken(req));
      return res.status(200).json({ message: 'Hello world!' });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }
}
```

## Wristband Auth Configuration Options

The NestJS SDK provides functionality to instantiate the Wristband SDK.  It takes an `AuthConfig` type as an argument. For the purpose of this SDK, these are stored as environment variables that should be protected in a key vault for production, or, they can be placed in a `.env` file for development environments.

| AuthConfig Field | Type | Required | Description |
| ---------- | ---- | -------- | ----------- |
| clientId | string | Yes | The client ID for the application. |
| clientSecret | string | Yes | The client secret for the application. |
| customApplicationLoginPageUrl | string | No | Custom Application-Level Login Page URL (Tenant Discovery) if you are building/self-hosting that portion of the UI. By default, the SDK will use your Wristband-hosted Application-Level Login page URL. The SDK will redirect to either the self-hosted or Wristband-hosted URL in certain cases where it cannot resolve a proper Tenant-Level Login URL. |
| dangerouslyDisableSecureCookies | boolean | No | USE WITH CAUTION: If set to true, the "Secure" attribute will not be included in any cookie settings. This should only be done when testing in local development (if necessary). |
| loginStateSecret | string | Yes | A secret -- 32 or more characters in length -- used for encryption and decryption of login state cookies. |
| loginUrl | string | Yes | The URL for initiating the login request. |
| redirectUri | string | Yes | The redirect URI for callback after authentication. |
| rootDomain | string | Depends | The root domain for your application. This value only needs to be specified if you use tenant subdomains in your login and redirect URLs. |
| scopes | string[] | No | The scopes required for authentication. Refer to the docs for [currently supported scopes](https://docs.wristband.dev/docs/oauth2-and-openid-connect-oidc#supported-openid-scopes). The default value is `[openid, offline_access, email]`. |
| useCustomDomains | boolean | No | Indicates whether custom domains are used for authentication. |
| useTenantSubdomains | boolean | No | Indicates whether tenant subdomains are used for authentication. |
| wristbandApplicationDomain | string | Yes | The vanity domain of the Wristband application. |

### WristbandExpressAuthModule and WristbandExpressAuthService

The `WristbandExpressAuthModule` is a dynamic NestJS module that integrates the Wristband Authentication Service for NestJS/Express-based applications. This module is designed to be globally available, ensuring the `WristbandExpressAuthService` can be easily injected and used across different modules in the application.

It offers a flexible setup through its `forRoot` method, allowing configuration of the service with custom `AuthConfig` as well as custom names for service injection, ensuring flexibility should multiple instances of the SDK in the same project be a requirement.

```typescript
WristbandExpressAuthModule.forRoot(
  // The AuthConfig expected by the Wristband SDK
  {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    ...the rest of the config...
  },
  // The optional name for the instance of the WristbandExpressAuthService provided by this module.
  'MyWristbandAuth',
);
```

If you make use of the optional name argument when calling `forRoot()`, you can inject the service like the following:

```typescript
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    // Provide custom name to the Inject decorator
    @Inject('MyWristbandAuth')
    private readonly wristbandAuth: WristbandExpressAuthService,
  ) {}
  
  ...
  ...
}
```

<br/>

## API / Functionality

This SDK is using the <ins>[Wristband express-auth SDK](https://github.com/wristband-dev/express-auth)</ins> internally for all Express support.  To learn more about the APIs, please refer to that GitHub README.

- <ins>[login()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#loginreq-request-res-response-config-loginconfig-promisevoid)</ins>
- <ins>[callback()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#callbackreq-request-res-response-promisecallbackresult)</ins>
- <ins>[logout()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#logoutreq-request-res-response-config-logoutconfig-promisevoid)</ins>
- <ins>[refreshTokenIfExpired()](https://github.com/wristband-dev/express-auth?tab=readme-ov-file#refreshtokenifexpiredrefreshtoken-string-expiresat-number-promisetokendata--null)</ins>

<br/>

## Questions

Reach out to the Wristband team at <support@wristband.dev> for any questions regarding this SDK.

<br/>
