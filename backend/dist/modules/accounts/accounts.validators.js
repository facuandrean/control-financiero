"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.createAccountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createAccountSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "El nombre debe ser un texto" })
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(255, "Máximo 255 caracteres"),
    bank: zod_1.default
        .string({ message: "El banco o entidad es obligatorio" })
        .min(3, "El banco o entidad es obligatorio")
        .max(255, "Máximo 255 caracteres"),
    type: zod_1.default.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], { message: "El tipo de cuenta debe ser uno de los valores válidos" }),
    tag: zod_1.default.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"], { message: "La etiqueta de cuenta no es válida" }),
    amount: zod_1.default
        .number({ message: "El saldo inicial debe ser un número válido" })
        .max(1000000000, "Monto máximo superado (1.000.000.000)")
        .default(0)
        .optional()
        .nullable(),
    description: zod_1.default
        .string({ message: "La descripción debe ser un texto" })
        .trim()
        .max(255, "Máximo 255 caracteres")
        .optional()
        .nullable(),
    lastDigits: zod_1.default
        .string({ message: "Los últimos dígitos deben ser texto" })
        .trim()
        .max(10, "Máximo 10 caracteres")
        .optional()
        .nullable(),
    // Campos de Tarjeta de Crédito
    creditLimit: zod_1.default
        .number({ message: "El límite de crédito debe ser un número" })
        .positive("El límite de crédito debe ser mayor a 0")
        .max(1000000000, "Límite máximo superado")
        .optional()
        .nullable(),
    closingDay: zod_1.default.number().int().min(1).max(31).optional().nullable(),
    dueDate: zod_1.default.number().int().min(1).max(31).optional().nullable(),
});
exports.updateAccountSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "El nombre debe ser un texto" })
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(255, "Máximo 255 caracteres")
        .optional(),
    description: zod_1.default
        .string({ message: "La descripción debe ser un texto" })
        .trim()
        .max(255, "Máximo 255 caracteres")
        .optional()
        .nullable(),
    lastDigits: zod_1.default
        .string({ message: "Los últimos dígitos deben ser texto" })
        .trim()
        .max(10, "Máximo 10 caracteres")
        .optional()
        .nullable(),
    type: zod_1.default
        .enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], { message: "El tipo de cuenta debe ser uno de los valores válidos" })
        .optional(),
    tag: zod_1.default
        .enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"], { message: "La etiqueta de cuenta no es válida" })
        .optional(),
    status: zod_1.default
        .enum(["Active", "Inactive"], { message: "El estado debe ser Activo o Inactivo" })
        .optional(),
    bank: zod_1.default
        .string({ message: "El banco debe ser un texto" })
        .min(3, "El banco debe tener al menos 3 caracteres")
        .max(255, "Máximo 255 caracteres")
        .optional(),
    amount: zod_1.default
        .number({ message: "El saldo debe ser un número válido" })
        .max(1000000000, "Monto máximo superado")
        .optional()
        .nullable(),
    dueDate: zod_1.default.number().int().min(1).max(31).optional().nullable(),
    closingDay: zod_1.default.number().int().min(1).max(31).optional().nullable(),
    creditLimit: zod_1.default
        .number({ message: "El límite de crédito debe ser un número positivo" })
        .positive("El límite de crédito debe ser mayor a 0")
        .max(1000000000, "Límite máximo superado")
        .optional()
        .nullable(),
});
