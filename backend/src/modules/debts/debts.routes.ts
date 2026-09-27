import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { debtController } from "./debts.controller";
import {
  createDebtSchema,
  updateDebtSchema,
  createDebtPaymentSchema,
} from "./debts.validators";

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

// Rutas de Deudas
router.get("/", debtController.getAllDebts);
router.get("/:id", debtController.getDebtById);
router.post("/", validate(createDebtSchema), debtController.createDebt);
router.patch("/:id", validate(updateDebtSchema), debtController.updateDebt);
router.delete("/:id", debtController.deleteDebt);

// Rutas de Pagos
router.post("/:id/payments", validate(createDebtPaymentSchema), debtController.addPayment);
router.delete("/payments/:paymentId", debtController.deletePayment);

export default router;
