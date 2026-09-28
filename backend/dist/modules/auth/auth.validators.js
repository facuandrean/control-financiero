"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    lastName: zod_1.z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    email: zod_1.z.string().email("Email inválido").min(1, "El email es requerido"),
    password: zod_1.z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(passwordRegex, "La contraseña no cumple con los requisitos"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido"),
    password: zod_1.z.string().min(1, "La contraseña es requerida"),
});
exports.googleLoginSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "El token de Google es requerido"),
});
