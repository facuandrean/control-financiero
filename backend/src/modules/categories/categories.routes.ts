import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { categoryController } from "./categories.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deactivateCategory);

export default router;