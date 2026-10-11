import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import {
  createTransactionSchema,
  payInstallmentSchema,
} from "./transactions.validators";
import { transactionController } from "./transactions.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", transactionController.getAllTransactions);
router.get("/pending", transactionController.getPendingInstallments);
router.get("/:id", transactionController.getTransactionById);
router.post("/", validate(createTransactionSchema), transactionController.createTransaction);
router.post("/:id/pay", validate(payInstallmentSchema), transactionController.payInstallment);
router.post("/:id/unpay", transactionController.unpayInstallment);
router.delete("/:id", transactionController.deleteTransaction);

export default router;
