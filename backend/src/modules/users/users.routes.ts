import { Router } from "express";
import { validate } from "@core/middlewares/validate.middleware";
import { changePasswordSchema, updateUserSchema } from "./users.validators";
import { userController } from "./users.controller";
import { authMiddleware } from "@core/middlewares/auth.middleware";

const router = Router();

// Todas las rutas de este archivo requieren estar autenticado
router.use(authMiddleware);

router.get("/me", userController.getProfile);
router.patch("/me", validate(updateUserSchema), userController.updateProfile);
router.post("/change-password", validate(changePasswordSchema), userController.changePassword);
router.delete("/me", userController.deleteAccount);

export default router;