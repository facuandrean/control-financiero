"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountSchema = exports.createAccountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createAccountSchema = zod_1.default.object({
    name: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres"),
    bank: zod_1.default.string().min(3, "El banco o entidad es obligatorio").max(255, "Máximo 255 caracteres"),
    type: zod_1.default.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos"),
    tag: zod_1.default.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"]),
    amount: zod_1.default.number().max(1000000000, "Monto máximo superado").default(0).optional(),
    description: zod_1.default.string().trim().max(255, "Máximo 255 caracteres").optional(),
    lastDigits: zod_1.default.string().trim().max(10, "Máximo 10 caracteres").optional(),
    // Campos de Tarjeta de Crédito
    creditLimit: zod_1.default.number().positive().max(1000000000).optional(),
    closingDay: zod_1.default.number().min(1).max(31).optional(),
    dueDate: zod_1.default.number().min(1).max(31).optional(),
});
exports.updateAccountSchema = zod_1.default.object({
    name: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres").optional(),
    description: zod_1.default.string().trim().max(255, "Máximo 255 caracteres").optional(),
    lastDigits: zod_1.default.string().trim().max(10, "Máximo 10 caracteres").optional(),
    type: zod_1.default.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos").optional(),
    tag: zod_1.default.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"], "El tag debe ser uno de los valores válidos").optional(),
    status: zod_1.default.enum(["Active", "Inactive"]).optional(),
    bank: zod_1.default.string().min(3, "El banco debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres").optional(),
    dueDate: zod_1.default.number().min(1).max(31).optional(),
    closingDay: zod_1.default.number().min(1).max(31).optional(),
    creditLimit: zod_1.default.number().positive().max(1000000000).optional(),
});
