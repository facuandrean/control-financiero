import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { validate } from "../../core/middlewares/validate.middleware";
import { loginSchema, registerSchema, googleLoginSchema } from "./auth.validators";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 intentos por minuto
  message: {
    status: "error",
    errorCode: "RATE_LIMIT_EXCEEDED",
    message: "Demasiados intentos. Por favor intentá nuevamente en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/google", validate(googleLoginSchema), authController.googleLogin);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;