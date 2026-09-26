"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email inválido"),
    password: zod_1.z.string().min(8).regex(passwordRegex).optional(),
    name: zod_1.z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    lastName: zod_1.z.string().min(3, "El apellido debe tener al menos 3 caracteres").optional(),
}).partial();
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "La contraseña actual es requerida"),
    newPassword: zod_1.z.string().min(8).regex(passwordRegex),
    confirmPassword: zod_1.z.string().min(1)
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["confirmPassword"],
});
