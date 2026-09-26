"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
exports.createTransactionSchema = zod_1.default.object({
    accountID: zod_1.default.string().regex(uuidRegex, "El ID de la cuenta debe ser un UUID válido"),
    categoryID: zod_1.default.string().regex(uuidRegex, "El ID de la categoría debe ser un UUID válido"),
    entityID: zod_1.default.string().regex(uuidRegex, "El ID de la entidad debe ser un UUID válido"),
    amount: zod_1.default.number().positive("El monto debe ser mayor a 0"),
    type: zod_1.default.enum(["Income", "Expense"], { message: "El tipo debe ser Income (Ingreso) o Expense (Egreso)" }),
    description: zod_1.default.string().trim().optional(),
});
exports.updateTransactionSchema = zod_1.default.object({
    status: zod_1.default.enum(["Recorded", "Reverted"]),
});
