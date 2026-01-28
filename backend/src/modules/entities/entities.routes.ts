import { Router } from "express";
import { authMiddleware } from "@core/middlewares/auth.middleware";
import { entityController } from "./entities.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", entityController.getAllEntities);
router.get("/:id", entityController.getEntityById);
router.post("/", entityController.createEntity);
router.patch("/:id", entityController.updateEntity);
router.delete("/:id", entityController.deactivateEntity);

export default router;

