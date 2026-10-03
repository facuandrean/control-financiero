"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebtPaymentSchema = exports.updateMovementSchema = exports.createMovementSchema = exports.updateDebtSchema = exports.createDebtSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDebtSchema = zod_1.default.object({
    entityID: zod_1.default.string().uuid("ID de entidad inválido"),
    type: zod_1.default.enum(["Payable", "Receivable"], { message: "El tipo debe ser Payable o Receivable" }),
    initialAmount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .min(0, "El monto inicial debe ser 0 o mayor")
        .max(1000000000, "El monto no puede superar 1.000.000.000")
        .optional()
        .default(0),
});
exports.updateDebtSchema = zod_1.default.object({
    status: zod_1.default.enum(["Pending", "Settled"], { message: "Estado inválido" }).optional(),
    initialAmount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .min(0, "El monto inicial debe ser 0 o mayor")
        .max(1000000000, "El monto no puede superar 1.000.000.000")
        .optional(),
});
exports.createMovementSchema = zod_1.default.object({
    type: zod_1.default.enum(["CHARGE", "PAYMENT"], { message: "El tipo debe ser CHARGE o PAYMENT" }),
    amount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .positive("El monto debe ser mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000"),
    description: zod_1.default
        .string({ message: "La descripción es obligatoria" })
        .min(1, "La descripción es obligatoria")
        .max(255, "Máximo 255 caracteres"),
    date: zod_1.default.string({ message: "La fecha es obligatoria" }).min(1, "La fecha es obligatoria"),
    accountID: zod_1.default
        .string()
        .uuid("ID de cuenta inválido")
        .optional()
        .nullable()
        .or(zod_1.default.literal("").transform(() => undefined)),
});
exports.updateMovementSchema = zod_1.default.object({
    description: zod_1.default.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
    date: zod_1.default.string().optional(),
    amount: zod_1.default.number().positive("El monto debe ser mayor a 0").max(1000000000).optional(),
});
// Legacy schema for backward compatibility if any client calls /:id/payments
exports.createDebtPaymentSchema = zod_1.default.object({
    amount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .positive("El monto a pagar debe ser mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000"),
    accountID: zod_1.default
        .string()
        .uuid("ID de cuenta inválido")
        .optional()
        .nullable()
        .or(zod_1.default.literal("").transform(() => undefined)),
    date: zod_1.default.string().max(50, "Fecha inválida").optional(),
    notes: zod_1.default.string().max(255, "Máximo 255 caracteres").nullable().optional(),
});
