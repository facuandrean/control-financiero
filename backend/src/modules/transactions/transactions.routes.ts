import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { transactionController } from "./transactions.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);
router.post("/", transactionController.createTransaction);
router.patch("/:id", transactionController.updateTransaction);

export default router;

