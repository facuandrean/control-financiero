"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDebtAccountSchema = exports.createDebtAccountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDebtAccountSchema = zod_1.default.object({
    personName: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    type: zod_1.default.enum(["Cobrar", "Pagar"], "El tipo debe ser 'Cobrar' o 'Pagar'"),
});
exports.updateDebtAccountSchema = zod_1.default.object({
    personName: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    type: zod_1.default.enum(["Cobrar", "Pagar"], "El tipo debe ser 'Cobrar' o 'Pagar'").optional(),
    status: zod_1.default.enum(["Open", "Settled"]).optional(),
});
