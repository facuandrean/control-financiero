"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDebtItemSchema = exports.createDebtItemSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDebtItemSchema = zod_1.default.object({
    debtAccountID: zod_1.default.string().uuid("El ID de la cuenta de deuda debe ser un UUID válido"),
    description: zod_1.default.string().min(3, "La descripción debe tener al menos 3 caracteres"),
    amount: zod_1.default.number().int("El monto debe ser un número entero").positive("El monto debe ser mayor a 0"),
});
exports.updateDebtItemSchema = zod_1.default.object({
    description: zod_1.default.string().min(3, "La descripción debe tener al menos 3 caracteres").optional(),
    amount: zod_1.default.number().int("El monto debe ser un número entero").positive("El monto debe ser mayor a 0").optional(),
    status: zod_1.default.enum(["Pending", "Paid"], "El estado debe ser 'Pending' o 'Paid'").optional(),
});
