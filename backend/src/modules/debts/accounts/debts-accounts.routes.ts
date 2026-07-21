import { Router } from "express";
import { authMiddleware } from "../../../core/middlewares/auth.middleware";
import { debtAccountController } from "./debts-accounts.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", debtAccountController.getAllDebtAccounts);
router.get("/:id", debtAccountController.getDebtAccountById);
router.post("/", debtAccountController.createDebtAccount);
router.patch("/update/:id", debtAccountController.updateDebtAccount);
router.patch("/deactivate/:id", debtAccountController.deactivateDebtAccount);
router.delete("/:id", debtAccountController.deleteDebtAccount);

export default router;
