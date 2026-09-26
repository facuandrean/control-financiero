"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_service_1 = require("./users.service");
const responses_1 = require("../../core/utils/responses");
const AppError_1 = require("../../core/utils/AppError");
const auth_controller_1 = require("../auth/auth.controller");
const db_1 = require("../../core/db/db");
const auth_schema_1 = require("../auth/auth.schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.userController = {
    // GET /me
    getProfile: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const user = await users_service_1.userService.getUserById(userID);
            const { password, ...publicProfile } = user;
            return (0, responses_1.sendSuccess)(res, publicProfile);
        }
        catch (error) {
            next(error);
        }
    },
    // PATCH /me
    updateProfile: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const updateData = req.body;
            const currentUser = await users_service_1.userService.getUserById(userID);
            if (updateData.email && updateData.email !== currentUser.email) {
                const isRepeatedEmail = await users_service_1.userService.findByEmail(updateData.email);
                if (isRepeatedEmail) {
                    throw new AppError_1.AppError("El mail ya está en uso", 409, "EMAIL_ALREADY_EXISTS");
                }
            }
            if (updateData.password) {
                updateData.password = await bcrypt_1.default.hash(updateData.password, 10);
            }
            const updatedUser = await users_service_1.userService.updateUser(userID, updateData);
            const { password, ...publicProfile } = updatedUser;
            return (0, responses_1.sendSuccess)(res, publicProfile, "Perfil actualizado con éxito");
        }
        catch (error) {
            next(error);
        }
    },
    // POST /change-password
    changePassword: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const { currentPassword, newPassword } = req.body;
            const user = await users_service_1.userService.getUserById(userID);
            const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new AppError_1.AppError("La contraseña actual es incorrecta", 401, "INVALID_PASSWORD");
            }
            const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
            await users_service_1.userService.updateUser(userID, { password: hashedNewPassword });
            return (0, responses_1.sendSuccess)(res, null, "Contraseña actualizada con éxito");
        }
        catch (error) {
            next(error);
        }
    },
    // DELETE /me
    deleteAccount: async (req, res, next) => {
        try {
            const userID = req.user.id;
            await db_1.db.delete(auth_schema_1.sessions).where((0, drizzle_orm_1.eq)(auth_schema_1.sessions.userID, userID));
            await users_service_1.userService.deleteUser(userID);
            (0, auth_controller_1.clearAuthCookies)(res);
            return (0, responses_1.sendSuccess)(res, null, "Cuenta eliminada correctamente");
        }
        catch (error) {
            next(error);
        }
    }
};
