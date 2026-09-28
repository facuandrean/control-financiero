import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { createEntitySchema, updateEntitySchema } from "./entities.validators";
import { entityController } from "./entities.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", entityController.getAllEntities);
router.get("/:id", entityController.getEntityById);
router.post("/", validate(createEntitySchema), entityController.createEntity);
router.patch("/:id", validate(updateEntitySchema), entityController.updateEntity);
router.delete("/:id", entityController.deactivateEntity);

export default router;

