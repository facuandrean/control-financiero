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
const auth_schema_1 = require("./auth.schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../core/utils/AppError");
exports.authService = {
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
    }
};
