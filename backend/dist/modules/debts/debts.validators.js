"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebtPaymentSchema = exports.updateDebtSchema = exports.createDebtSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDebtSchema = zod_1.default.object({
    entityID: zod_1.default.string().uuid("ID de entidad inválido"),
    type: zod_1.default.enum(["Payable", "Receivable"]),
    description: zod_1.default.string().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
    totalAmount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .positive("El monto total debe ser mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000"),
    dueDate: zod_1.default.string().max(50, "Fecha inválida").nullable().optional().or(zod_1.default.literal("").transform(() => null)),
});
exports.updateDebtSchema = zod_1.default.object({
    entityID: zod_1.default.string().uuid("ID de entidad inválido").optional(),
    type: zod_1.default.enum(["Payable", "Receivable"]).optional(),
    description: zod_1.default.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
    totalAmount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .positive("El monto total debe ser mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000")
        .optional(),
    dueDate: zod_1.default.string().max(50, "Fecha inválida").nullable().optional().or(zod_1.default.literal("").transform(() => null)),
});
exports.createDebtPaymentSchema = zod_1.default.object({
    amount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .positive("El monto a pagar debe ser mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000"),
    accountID: zod_1.default.string().uuid("ID de cuenta inválido"),
    date: zod_1.default.string().max(50, "Fecha inválida").optional(),
    notes: zod_1.default.string().max(255, "Máximo 255 caracteres").nullable().optional(),
});
