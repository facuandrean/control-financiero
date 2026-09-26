"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEntitySchema = exports.createEntitySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createEntitySchema = zod_1.default.object({
    name: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: zod_1.default.string().trim().optional()
});
exports.updateEntitySchema = zod_1.default.object({
    name: zod_1.default.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    description: zod_1.default.string().trim().optional(),
    status: zod_1.default.enum(["Active", "Inactive"]).optional(),
});
