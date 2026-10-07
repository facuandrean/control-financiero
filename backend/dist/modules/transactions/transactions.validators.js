"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const optionalUuid = zod_1.default
    .string()
    .uuid("Formato de ID inválido")
    .nullable()
    .optional()
    .or(zod_1.default.literal("").transform(() => null));
exports.createTransactionSchema = zod_1.default.object({
    type: zod_1.default.enum(["Income", "Expense", "Transfer"]),
    amount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .int("El monto debe ser un número entero")
        .positive("El monto debe ser positivo y mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000"),
    accountID: zod_1.default.string().uuid("ID de cuenta inválido"),
    toAccountID: optionalUuid,
    categoryID: optionalUuid,
    entityID: optionalUuid,
    date: zod_1.default
        .string({ message: "La fecha es obligatoria" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
    description: zod_1.default.string().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
    installments: zod_1.default.number().int().min(1).max(72).optional().default(1),
});
exports.updateTransactionSchema = zod_1.default.object({
    type: zod_1.default.enum(["Income", "Expense", "Transfer"]).optional(),
    amount: zod_1.default
        .number({ message: "El monto debe ser un número" })
        .int("El monto debe ser un número entero")
        .positive("El monto debe ser positivo y mayor a 0")
        .max(1000000000, "El monto no puede superar 1.000.000.000")
        .optional(),
    accountID: zod_1.default.string().uuid("ID de cuenta inválido").optional(),
    toAccountID: optionalUuid,
    categoryID: optionalUuid,
    entityID: optionalUuid,
    date: zod_1.default
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
        .optional(),
    description: zod_1.default.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
    installments: zod_1.default.number().int().min(1).max(72).optional(),
});
