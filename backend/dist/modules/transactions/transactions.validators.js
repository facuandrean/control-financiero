"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTransactionSchema = zod_1.default.object({
    type: zod_1.default.enum(["Income", "Expense", "Transfer"]),
    amount: zod_1.default
        .number()
        .int("El monto debe ser un número entero")
        .positive("El monto debe ser positivo y mayor a 0"),
    accountID: zod_1.default.string().min(1, "La cuenta origen es obligatoria"),
    toAccountID: zod_1.default.string().nullable().optional(),
    categoryID: zod_1.default.string().nullable().optional(),
    entityID: zod_1.default.string().nullable().optional(),
    date: zod_1.default.string().min(1, "La fecha es obligatoria"),
    description: zod_1.default.string().min(1, "La descripción es obligatoria"),
});
exports.updateTransactionSchema = zod_1.default.object({
    type: zod_1.default.enum(["Income", "Expense", "Transfer"]).optional(),
    amount: zod_1.default
        .number()
        .int("El monto debe ser un número entero")
        .positive("El monto debe ser positivo y mayor a 0")
        .optional(),
    accountID: zod_1.default.string().min(1, "La cuenta origen no puede estar vacía").optional(),
    toAccountID: zod_1.default.string().nullable().optional(),
    categoryID: zod_1.default.string().nullable().optional(),
    entityID: zod_1.default.string().nullable().optional(),
    date: zod_1.default.string().min(1, "La fecha no puede estar vacía").optional(),
    description: zod_1.default.string().min(1, "La descripción no puede estar vacía").optional(),
});
