"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const db_1 = require("../../core/db/db");
const config_1 = require("../../config");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const auth_schema_1 = require("./auth.schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../core/utils/AppError");
const users_service_1 = require("../users/users.service");
const categories_seed_1 = require("../categories/categories.seed");
exports.authService = {
    // Registro tradicional de usuario con inicialización de categorías por defecto
    register: async (data) => {
        const existingUser = await users_service_1.userService.findByEmail(data.email);
        if (existingUser) {
            throw new AppError_1.AppError("El email ya está registrado", 409, "AUTH_EMAIL_EXISTS");
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const newUser = await users_service_1.userService.createUser({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
        });
        await (0, categories_seed_1.seedDefaultCategories)(newUser.id);
        const { password: _, ...publicUser } = newUser;
        return publicUser;
    },
    // Genera un string aleatorio que será el Refresh Token
    generateRefreshToken: () => {
        return crypto_1.default.randomBytes(40).toString('hex');
    },
    // Hasheamos el token para guardarlo en la base de datos
    hashToken: (token) => {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    },
    // Creamos la sesión y devolvemos los tokens al controlador
    createSession: async (userID, userAgent, ipAddress) => {
        const accessToken = jsonwebtoken_1.default.sign({ id: userID }, config_1.config.accessTokenSecret, { expiresIn: "15m" });
        const refreshToken = exports.authService.generateRefreshToken();
        const tokenHashed = exports.authService.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
        await db_1.db.insert(auth_schema_1.sessions).values({
            id: crypto_1.default.randomUUID(),
            userID: userID,
            tokenHashed,
            userAgent,
            ipAddress,
            expiresAt,
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        });
        return { accessToken, refreshToken };
    },
    // Validamos el refresh token y creamos un nuevo access token
    validateRefreshToken: async (refreshToken) => {
        const hashed = exports.authService.hashToken(refreshToken);
        const sessionData = await db_1.db.select().from(auth_schema_1.sessions).where((0, drizzle_orm_1.eq)(auth_schema_1.sessions.tokenHashed, hashed)).get();
        if (!sessionData) {
            throw new AppError_1.AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
        }
        if (new Date(sessionData.expiresAt) < new Date()) {
            await db_1.db.delete(auth_schema_1.sessions).where((0, drizzle_orm_1.eq)(auth_schema_1.sessions.id, sessionData.id));
            throw new AppError_1.AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: sessionData.userID }, config_1.config.accessTokenSecret, { expiresIn: "15m" });
        return { accessToken };
    },
    googleLogin: async (googleToken, userAgent = 'unknown', ipAddress = 'unknown') => {
        const clientId = config_1.config.googleClientId || '867079303651-jstcsunru0h51bo1t6a2ej601sgapmaf.apps.googleusercontent.com';
        const client = new google_auth_library_1.OAuth2Client(clientId);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: clientId,
            });
        }
        catch {
            throw new AppError_1.AppError("Token de Google inválido o expirado", 401, "AUTH_INVALID_GOOGLE_TOKEN");
        }
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new AppError_1.AppError("No se pudo obtener la información de la cuenta de Google", 400, "AUTH_GOOGLE_PAYLOAD_ERROR");
        }
        const email = payload.email;
        const name = payload.given_name || payload.name || "Usuario";
        const lastName = payload.family_name || "";
        let user = await users_service_1.userService.findByEmail(email);
        if (!user) {
            const randomPassword = crypto_1.default.randomUUID();
            const hashedPassword = await bcrypt_1.default.hash(randomPassword, 10);
            user = await users_service_1.userService.createUser({
                name,
                lastName,
                email,
                password: hashedPassword,
            });
            await (0, categories_seed_1.seedDefaultCategories)(user.id);
        }
        const { accessToken, refreshToken } = await exports.authService.createSession(user.id, userAgent, ipAddress);
        const { password: _, ...publicUser } = user;
        return {
            user: publicUser,
            accessToken,
            refreshToken,
            sessionToken: accessToken,
        };
    }
};
