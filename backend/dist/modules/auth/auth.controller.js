"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.clearAuthCookies = exports.cookieBaseOptions = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const responses_1 = require("../../core/utils/responses");
const AppError_1 = require("../../core/utils/AppError");
const auth_schema_1 = require("./auth.schema");
const db_1 = require("../../core/db/db");
const drizzle_orm_1 = require("drizzle-orm");
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
exports.cookieBaseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax'),
    path: '/',
};
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', exports.cookieBaseOptions);
    res.clearCookie('refreshToken', exports.cookieBaseOptions);
};
exports.clearAuthCookies = clearAuthCookies;
exports.authController = {
    // POST /register
    register: async (req, res, next) => {
        try {
            const { email, password, name, lastName } = req.body;
            const publicUser = await auth_service_1.authService.register({ name, lastName, email, password });
            return (0, responses_1.sendSuccess)(res, publicUser, "Usuario registrado con éxito", 201);
        }
        catch (error) {
            next(error);
        }
    },
    // POST /login
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await users_service_1.userService.findByEmail(email);
            if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
                throw new AppError_1.AppError("Email o contraseña incorrectos", 401, "AUTH_INVALID_CREDENTIALS");
            }
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const { accessToken, refreshToken } = await auth_service_1.authService.createSession(user.id, userAgent, ipAddress);
            res.cookie('accessToken', accessToken, {
                ...exports.cookieBaseOptions,
                maxAge: 15 * 60 * 1000 // 15 minutos
            });
            res.cookie('refreshToken', refreshToken, {
                ...exports.cookieBaseOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });
            const { password: _, ...publicUser } = user;
            return (0, responses_1.sendSuccess)(res, { user: publicUser }, "Login exitoso");
        }
        catch (error) {
            next(error);
        }
    },
    // POST /refresh
    refresh: async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                (0, exports.clearAuthCookies)(res);
                throw new AppError_1.AppError("No se proporcionó Refresh Token", 401, "AUTH_NO_TOKEN");
            }
            const { accessToken } = await auth_service_1.authService.validateRefreshToken(refreshToken);
            // Actualizamos la cookie del Access Token
            res.cookie('accessToken', accessToken, {
                ...exports.cookieBaseOptions,
                maxAge: 15 * 60 * 1000
            });
            return (0, responses_1.sendSuccess)(res, null, "Token actualizado con éxito");
        }
        catch (error) {
            (0, exports.clearAuthCookies)(res);
            next(error);
        }
    },
    // POST /logout
    logout: async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                const hashed = auth_service_1.authService.hashToken(refreshToken);
                await db_1.db.delete(auth_schema_1.sessions).where((0, drizzle_orm_1.eq)(auth_schema_1.sessions.tokenHashed, hashed));
            }
            // Limpiamos AMBAS cookies con sus opciones completas
            (0, exports.clearAuthCookies)(res);
            return (0, responses_1.sendSuccess)(res, null, "Sesión cerrada correctamente");
        }
        catch (error) {
            (0, exports.clearAuthCookies)(res);
            next(error);
        }
    },
    // POST /google
    googleLogin: async (req, res, next) => {
        try {
            const { token } = req.body;
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
            const { user, accessToken, refreshToken, sessionToken } = await auth_service_1.authService.googleLogin(token, userAgent, ipAddress);
            res.cookie('accessToken', accessToken, {
                ...exports.cookieBaseOptions,
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', refreshToken, {
                ...exports.cookieBaseOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return (0, responses_1.sendSuccess)(res, { user, sessionToken }, "Inicio de sesión con Google exitoso");
        }
        catch (error) {
            next(error);
        }
    }
};
