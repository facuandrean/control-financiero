import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "./categories.validators";
import { categoryController } from "./categories.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", validate(createCategorySchema), categoryController.createCategory);
router.patch("/:id", validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deactivateCategory);

export default router;