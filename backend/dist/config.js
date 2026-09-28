"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    dbUrl: process.env.DB_URL,
    dbToken: process.env.DB_TOKEN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '867079303651-jstcsunru0h51bo1t6a2ej601sgapmaf.apps.googleusercontent.com',
};
