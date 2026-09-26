"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../core/utils/AppError");
const config_1 = require("../../config");
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Obtener el token directamente de las cookies
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new AppError_1.AppError("No autorizado: Token faltante", 401, "AUTH_NO_TOKEN");
        }
        // 2. Verificar el token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.accessTokenSecret);
            // 3. Inyectar el ID del usuario en el request para que los controladores lo usen
            req.user = { id: decoded.id };
            next();
        }
        catch (jwtError) {
            throw new AppError_1.AppError("Token inválido o expirado", 401, "AUTH_INVALID_TOKEN");
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
