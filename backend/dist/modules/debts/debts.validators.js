"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebtPaymentSchema = exports.updateDebtSchema = exports.createDebtSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDebtSchema = zod_1.default.object({
    entityID: zod_1.default.string().min(1, "La entidad es obligatoria"),
    type: zod_1.default.enum(["Payable", "Receivable"]),
    description: zod_1.default.string().min(1, "La descripción es obligatoria"),
    totalAmount: zod_1.default
        .number()
        .int("El monto debe ser un número entero")
        .positive("El monto total debe ser mayor a 0"),
    dueDate: zod_1.default.string().nullable().optional(),
});
exports.updateDebtSchema = zod_1.default.object({
    entityID: zod_1.default.string().min(1, "La entidad no puede estar vacía").optional(),
    type: zod_1.default.enum(["Payable", "Receivable"]).optional(),
    description: zod_1.default.string().min(1, "La descripción no puede estar vacía").optional(),
    totalAmount: zod_1.default
        .number()
        .int("El monto debe ser un número entero")
        .positive("El monto total debe ser mayor a 0")
        .optional(),
    dueDate: zod_1.default.string().nullable().optional(),
});
exports.createDebtPaymentSchema = zod_1.default.object({
    amount: zod_1.default
        .number()
        .int("El monto debe ser un número entero")
        .positive("El monto a pagar debe ser mayor a 0"),
    date: zod_1.default.string().optional(),
    notes: zod_1.default.string().nullable().optional(),
});
