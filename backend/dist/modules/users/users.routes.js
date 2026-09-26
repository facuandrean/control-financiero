"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const users_validators_1 = require("./users.validators");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas de este archivo requieren estar autenticado
router.use(auth_middleware_1.authMiddleware);
router.get("/me", users_controller_1.userController.getProfile);
router.patch("/me", (0, validate_middleware_1.validate)(users_validators_1.updateUserSchema), users_controller_1.userController.updateProfile);
router.post("/change-password", (0, validate_middleware_1.validate)(users_validators_1.changePasswordSchema), users_controller_1.userController.changePassword);
router.delete("/me", users_controller_1.userController.deleteAccount);
exports.default = router;
