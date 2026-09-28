import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/summary", dashboardController.getSummary);

export default router;
