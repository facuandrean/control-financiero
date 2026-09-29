"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const debts_controller_1 = require("./debts.controller");
const debts_validators_1 = require("./debts.validators");
const router = (0, express_1.Router)();
// Todas las rutas requieren estar autenticado
router.use(auth_middleware_1.authMiddleware);
// Rutas de Deudas
router.get("/", debts_controller_1.debtController.getAllDebts);
router.get("/:id", debts_controller_1.debtController.getDebtById);
router.post("/", (0, validate_middleware_1.validate)(debts_validators_1.createDebtSchema), debts_controller_1.debtController.createDebt);
router.patch("/:id", (0, validate_middleware_1.validate)(debts_validators_1.updateDebtSchema), debts_controller_1.debtController.updateDebt);
router.delete("/:id", debts_controller_1.debtController.deleteDebt);
// Rutas de Movimientos (Ledger)
router.post("/:id/movements", (0, validate_middleware_1.validate)(debts_validators_1.createMovementSchema), debts_controller_1.debtController.addMovement);
router.delete("/movements/:movementId", debts_controller_1.debtController.deleteMovement);
// Rutas de Pagos (compatibilidad)
router.post("/:id/payments", (0, validate_middleware_1.validate)(debts_validators_1.createDebtPaymentSchema), debts_controller_1.debtController.addLegacyPayment);
router.delete("/payments/:paymentId", debts_controller_1.debtController.deleteMovement);
exports.default = router;
