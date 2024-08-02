/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(1), exports);
__exportStar(__webpack_require__(3), exports);


/***/ }),
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WristbandModule = void 0;
const common_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(3);
const session_service_1 = __webpack_require__(7);
const csrf_middleware_1 = __webpack_require__(9);
const wristband_auth_middleware_1 = __webpack_require__(10);
let WristbandModule = class WristbandModule {
    constructor(wristbandAuth) {
        this.wristbandAuth = wristbandAuth;
    }
    configure(consumer) {
        consumer.apply(wristband_auth_middleware_1.WristbandAuthMiddleware).forRoutes(...this.wristbandAuth.getWristbandAuthRoutes());
        consumer.apply(csrf_middleware_1.CsrfMiddleware).forRoutes(...this.wristbandAuth.getCsrfMiddlewareRoutes());
    }
};
exports.WristbandModule = WristbandModule;
exports.WristbandModule = WristbandModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [auth_service_1.WristbandAuthService, session_service_1.SessionService],
        exports: [auth_service_1.WristbandAuthService],
    }),
    __param(0, (0, common_1.Inject)(auth_service_1.WristbandAuthService)),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.WristbandAuthService !== "undefined" && auth_service_1.WristbandAuthService) === "function" ? _a : Object])
], WristbandModule);


/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WristbandAuthService = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(4);
const express_auth_1 = __webpack_require__(5);
const routes_utils_1 = __webpack_require__(6);
let WristbandAuthService = class WristbandAuthService {
    constructor(configService) {
        this.configService = configService;
    }
    getConfigValue(key, errorMessage) {
        try {
            return this.configService.get(key);
        }
        catch (error) {
            console.error(errorMessage);
            return undefined;
        }
    }
    getFrontendDomain() {
        return this.getConfigValue('FRONTEND_DOMAIN', 'FRONTEND_DOMAIN not found.');
    }
    getClientId() {
        return this.getConfigValue('CLIENT_ID', 'CLIENT_ID not found.');
    }
    getClientSecret() {
        return this.getConfigValue('CLIENT_SECRET', 'CLIENT_SECRET not found.');
    }
    getCsrfTokenCookieName() {
        return this.getConfigValue('CSRF_TOKEN_COOKIE_NAME', 'CSRF_TOKEN_COOKIE_NAME not found.');
    }
    getCallbackUrl() {
        return this.getConfigValue('CALLBACK_URL', 'CALLBACK_URL not found.');
    }
    getDomainFormat() {
        return this.getConfigValue('DOMAIN_FORMAT', 'DOMAIN_FORMAT not found.');
    }
    getLoginUrl() {
        return this.getConfigValue('LOGIN_URL', 'LOGIN_URL not found.');
    }
    getLoginStateCookieSecret() {
        return this.getConfigValue('LOGIN_STATE_COOKIE_SECRET', 'LOGIN_STATE_COOKIE_SECRET not found.');
    }
    getSessionCookieName() {
        return this.getConfigValue('SESSION_COOKIE_NAME', 'SESSION_COOKIE_NAME not found.');
    }
    getSessionCookieSecret() {
        return this.getConfigValue('SESSION_COOKIE_SECRET', 'SESSION_COOKIE_SECRET not found.');
    }
    getSessionCookieMaxAge() {
        return this.getConfigValue('SESSION_COOKIE_MAX_AGE', 'SESSION_COOKIE_MAX_AGE not found.');
    }
    getSecureCookiesEnabled() {
        return this.getConfigValue('SECURE_COOKIES_ENABLED', 'SECURE_COOKIES_ENABLED not found.') === 'true';
    }
    getSignupUrl() {
        return this.getConfigValue('SIGNUP_URL', 'SIGNUP_URL not found.');
    }
    getTenantLoginUrl() {
        return this.getConfigValue('TENANT_LOGIN_URL', 'TENANT_LOGIN_URL not found.');
    }
    getUseCustomDomains() {
        return this.getConfigValue('USE_CUSTOM_DOMAINS', 'USE_CUSTOM_DOMAINS is not found.') === 'true';
    }
    getUseTenantSubdomains() {
        return this.getConfigValue('USE_TENANT_SUBDOMAINS', 'USE_TENANT_SUBDOMAINS is not found.') === 'true';
    }
    getUserAgentUrlProtocol() {
        return this.getConfigValue('USER_AGENT_URL_PROTOCOL', 'USER_AGENT_URL_PROTOCOL not found.');
    }
    getWristbandApplicationDomain() {
        return this.getConfigValue('WRISTBAND_APPLICATION_DOMAIN', 'WRISTBAND_APPLICATION_DOMAIN not found.');
    }
    getPort() {
        return this.getConfigValue('PORT', 'PORT not found. Using default application port.');
    }
    getNodeEnv() {
        return this.getConfigValue('NODE_ENV', 'NODE_ENV not found. Using development environment.');
    }
    getWristbandAuthRoutes(routes) {
        try {
            if (!routes) {
                const routeList = this.getConfigValue('WRISTBAND_AUTH_MIDDLEWARE_ROUTES', 'WRISTBAND_AUTH_MIDDLEWARE_ROUTES not found. Routes will not be protected.');
                return (0, routes_utils_1.setRoutesForMiddleware)(routeList);
            }
            return (0, routes_utils_1.setRoutesForMiddleware)(routes);
        }
        catch (error) {
            console.error('Error getting Wristband Auth Middleware Routes. Routes will not be protected.');
            return [];
        }
    }
    getCsrfMiddlewareRoutes(routes) {
        try {
            if (!routes) {
                const routeList = this.getConfigValue('WRISTBAND_CSRF_MIDDLEWARE_ROUTES', 'WRISTBAND_CSRF_MIDDLEWARE_ROUTES not found. Routes will not be protected.');
                return (0, routes_utils_1.setRoutesForMiddleware)(routeList);
            }
            return (0, routes_utils_1.setRoutesForMiddleware)(routes);
        }
        catch (error) {
            console.error('Error getting CSRF Middleware Routes. Routes will not be protected.');
            return [];
        }
    }
    getWristbandAuth() {
        return (0, express_auth_1.createWristbandAuth)({
            clientId: this.getClientId() || '',
            clientSecret: this.getClientSecret() || '',
            dangerouslyDisableSecureCookies: this.getSecureCookiesEnabled(),
            loginStateSecret: this.getLoginStateCookieSecret() || '',
            loginUrl: this.getLoginUrl() || '',
            redirectUri: this.getCallbackUrl() || '',
            rootDomain: this.getFrontendDomain(),
            useCustomDomains: this.getUseCustomDomains(),
            useTenantSubdomains: this.getUseTenantSubdomains(),
            wristbandApplicationDomain: this.getWristbandApplicationDomain() || '',
        });
    }
    getRefreshTokenIfExpired(refreshToken, expiresAt) {
        return this.getWristbandAuth().refreshTokenIfExpired(refreshToken, expiresAt);
    }
};
exports.WristbandAuthService = WristbandAuthService;
exports.WristbandAuthService = WristbandAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], WristbandAuthService);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@wristband/express-auth");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setRoutesForMiddleware = setRoutesForMiddleware;
function setRoutesForMiddleware(routes) {
    if (Array.isArray(routes)) {
        return routes.map((route) => {
            if (typeof route === 'object' && Object.keys(route).includes('path')) {
                const { path } = route;
                return path;
            }
            return route;
        });
    }
    if (typeof routes === 'string') {
        return [...routes.split(',')];
    }
    if (typeof routes === 'object' && Object.keys(routes).includes('path')) {
        const { path } = routes;
        return [path];
    }
    return [];
}


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionService = void 0;
const common_1 = __webpack_require__(2);
const csrf_1 = __importDefault(__webpack_require__(8));
const auth_service_1 = __webpack_require__(3);
let SessionService = class SessionService {
    constructor(wristbandAuth) {
        this.wristbandAuth = wristbandAuth;
        this.csrfTokens = new csrf_1.default();
        this.sessionCookieAge = this.wristbandAuth.getSessionCookieMaxAge();
        this.secureCookiesEnabled = this.wristbandAuth.getSecureCookiesEnabled();
    }
    expiresAtWithBuffer(numOfSeconds) {
        const secondsWithBuffer = numOfSeconds - 300;
        return Date.now().toLocaleString() + secondsWithBuffer * 1000;
    }
    createCsrfSecret() {
        return this.csrfTokens.secretSync();
    }
    isCsrfTokenValid(req) {
        const xsrfToken = Array.isArray(req.headers['x-xsrf-token'])
            ? req.headers['x-xsrf-token'][0]
            : req.headers['x-xsrf-token'];
        return this.csrfTokens.verify(req.session.csrfSecret, xsrfToken);
    }
    updateCsrfTokenAndCookie(req, res, cookieName) {
        const csrfToken = this.csrfTokens.create(req.session.csrfSecret);
        return res.cookie(cookieName, csrfToken, {
            httpOnly: false,
            maxAge: this.sessionCookieAge * 1000,
            path: '/',
            sameSite: true,
            secure: this.secureCookiesEnabled,
        });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.WristbandAuthService !== "undefined" && auth_service_1.WristbandAuthService) === "function" ? _a : Object])
], SessionService);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("csrf");

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CsrfMiddleware = void 0;
const common_1 = __webpack_require__(2);
const session_service_1 = __webpack_require__(7);
const auth_service_1 = __webpack_require__(3);
let CsrfMiddleware = class CsrfMiddleware {
    constructor(sessionService, wristbandAuth) {
        this.sessionService = sessionService;
        this.wristbandAuth = wristbandAuth;
    }
    use(req, res, next) {
        if (!this.sessionService.isCsrfTokenValid(req)) {
            return res.status(401).send();
        }
        const cookieName = this.wristbandAuth.getCsrfTokenCookieName();
        this.sessionService.updateCsrfTokenAndCookie(req, res, cookieName);
        return next();
    }
};
exports.CsrfMiddleware = CsrfMiddleware;
exports.CsrfMiddleware = CsrfMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof session_service_1.SessionService !== "undefined" && session_service_1.SessionService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.WristbandAuthService !== "undefined" && auth_service_1.WristbandAuthService) === "function" ? _b : Object])
], CsrfMiddleware);


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WristbandAuthMiddleware = void 0;
const common_1 = __webpack_require__(2);
const auth_service_1 = __webpack_require__(3);
const server_utils_1 = __webpack_require__(11);
let WristbandAuthMiddleware = class WristbandAuthMiddleware {
    constructor(wristbandAuth) {
        this.wristbandAuth = wristbandAuth;
    }
    async use(req, res, next) {
        const { csrfSecret, expiresAt, isAuthenticated, refreshToken } = req.session;
        if (!isAuthenticated || !csrfSecret) {
            return res.status(401).send();
        }
        try {
            const tokenData = await this.wristbandAuth.getRefreshTokenIfExpired(refreshToken, expiresAt);
            if (tokenData) {
                req.session.accessToken = tokenData.accessToken;
                req.session.expiresAt =
                    Date.now() + tokenData.expiresIn * 1000;
                req.session.refreshToken = tokenData.refreshToken;
            }
            await req.session.save();
            return next();
        }
        catch (error) {
            console.error((0, server_utils_1.errorResponse)(500, error));
            return res.status(401).send();
        }
    }
};
exports.WristbandAuthMiddleware = WristbandAuthMiddleware;
exports.WristbandAuthMiddleware = WristbandAuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.WristbandAuthService)),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.WristbandAuthService !== "undefined" && auth_service_1.WristbandAuthService) === "function" ? _a : Object])
], WristbandAuthMiddleware);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorResponse = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
const errorResponse = (status, message) => {
    return new CustomError(message, status);
};
exports.errorResponse = errorResponse;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;