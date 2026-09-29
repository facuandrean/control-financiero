import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/auth.middleware";
import { validate } from "../../core/middlewares/validate.middleware";
import { debtController } from "./debts.controller";
import {
  createDebtSchema,
  updateDebtSchema,
  createMovementSchema,
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

// Rutas de Movimientos (Ledger)
router.post("/:id/movements", validate(createMovementSchema), debtController.addMovement);
router.delete("/movements/:movementId", debtController.deleteMovement);

// Rutas de Pagos (compatibilidad)
router.post("/:id/payments", validate(createDebtPaymentSchema), debtController.addLegacyPayment);
router.delete("/payments/:paymentId", debtController.deleteMovement);

export default router;
