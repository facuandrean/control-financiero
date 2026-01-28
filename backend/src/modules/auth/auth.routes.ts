import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "@core/middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validators";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;