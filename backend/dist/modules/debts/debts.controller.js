"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtController = void 0;
const debts_service_1 = require("./debts.service");
const responses_1 = require("../../core/utils/responses");
const debts_validators_1 = require("./debts.validators");
exports.debtController = {
    getAllDebts: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const debts = await debts_service_1.debtService.getDebts(userID);
            return (0, responses_1.sendSuccess)(res, debts);
        }
        catch (error) {
            next(error);
        }
    },
    getDebtById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const debt = await debts_service_1.debtService.getDebtById(id, userID);
            return (0, responses_1.sendSuccess)(res, debt);
        }
        catch (error) {
            next(error);
        }
    },
    createDebt: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const data = debts_validators_1.createDebtSchema.parse(req.body);
            const newDebt = await debts_service_1.debtService.createDebt({ ...data, userID });
            return (0, responses_1.sendSuccess)(res, newDebt, "Deuda creada con éxito", 201);
        }
        catch (error) {
            next(error);
        }
    },
    updateDebt: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const data = req.body;
            const updatedDebt = await debts_service_1.debtService.updateDebt(id, userID, data);
            return (0, responses_1.sendSuccess)(res, updatedDebt, "Deuda actualizada con éxito");
        }
        catch (error) {
            next(error);
        }
    },
    deleteDebt: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await debts_service_1.debtService.deleteDebt(id, userID);
            return (0, responses_1.sendSuccess)(res, null, "Deuda eliminada con éxito");
        }
        catch (error) {
            next(error);
        }
    },
    addMovement: async (req, res, next) => {
        try {
            const debtID = req.params.id;
            const userID = req.user.id;
            const validatedData = debts_validators_1.createMovementSchema.parse(req.body);
            const result = await debts_service_1.debtService.addMovement(debtID, userID, validatedData);
            const message = validatedData.type === "PAYMENT"
                ? "Pago registrado con éxito"
                : "Cargo añadido con éxito";
            return (0, responses_1.sendSuccess)(res, result, message, 201);
        }
        catch (error) {
            next(error);
        }
    },
    deleteMovement: async (req, res, next) => {
        try {
            const movementId = (req.params.movementId || req.params.paymentId);
            const userID = req.user.id;
            const result = await debts_service_1.debtService.deleteMovement(movementId, userID);
            return (0, responses_1.sendSuccess)(res, result, "Movimiento eliminado con éxito");
        }
        catch (error) {
            next(error);
        }
    },
    // Handler para soportar compatibilidad con rutas legadas de pago
    addLegacyPayment: async (req, res, next) => {
        try {
            const debtID = req.params.id;
            const userID = req.user.id;
            const legacyData = debts_validators_1.createDebtPaymentSchema.parse(req.body);
            const movementPayload = {
                type: "PAYMENT",
                amount: legacyData.amount,
                description: legacyData.notes || "Pago de deuda",
                date: legacyData.date || new Date().toISOString().split("T")[0],
                accountID: legacyData.accountID || undefined,
            };
            const result = await debts_service_1.debtService.addMovement(debtID, userID, movementPayload);
            return (0, responses_1.sendSuccess)(res, result, "Pago registrado con éxito", 201);
        }
        catch (error) {
            next(error);
        }
    },
};
