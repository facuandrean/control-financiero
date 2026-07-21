import { Router } from "express";
import { authMiddleware } from "../../../core/middlewares/auth.middleware";
import { debtItemController } from "./debts-items.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:debtAccountID", debtItemController.getAllDebtItems);
router.get("/:debtAccountID/:id", debtItemController.getDebtItemById);
router.post("/:debtAccountID", debtItemController.createDebtItem);
router.patch("/:debtAccountID/:id", debtItemController.updateDebtItem);
router.delete("/:debtAccountID/:id", debtItemController.deactivateDebtItem);

export default router;
