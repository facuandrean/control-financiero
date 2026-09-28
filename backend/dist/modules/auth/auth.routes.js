"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const auth_validators_1 = require("./auth.validators");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // 5 intentos por minuto
    message: {
        status: "error",
        errorCode: "RATE_LIMIT_EXCEEDED",
        message: "Demasiados intentos. Por favor intentá nuevamente en un minuto.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post("/register", authLimiter, (0, validate_middleware_1.validate)(auth_validators_1.registerSchema), auth_controller_1.authController.register);
router.post("/login", authLimiter, (0, validate_middleware_1.validate)(auth_validators_1.loginSchema), auth_controller_1.authController.login);
router.post("/google", (0, validate_middleware_1.validate)(auth_validators_1.googleLoginSchema), auth_controller_1.authController.googleLogin);
router.post("/refresh", auth_controller_1.authController.refresh);
router.post("/logout", auth_controller_1.authController.logout);
exports.default = router;
