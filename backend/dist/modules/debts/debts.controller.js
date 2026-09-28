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
            const data = req.body;
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
    addPayment: async (req, res, next) => {
        try {
            const id = req.params.id; // debtID
            const userID = req.user.id;
            const validatedData = debts_validators_1.createDebtPaymentSchema.parse(req.body);
            const result = await debts_service_1.debtService.addPayment(id, userID, validatedData);
            return (0, responses_1.sendSuccess)(res, result, "Pago registrado con éxito", 201);
        }
        catch (error) {
            next(error);
        }
    },
    deletePayment: async (req, res, next) => {
        try {
            const paymentId = req.params.paymentId;
            const userID = req.user.id;
            const result = await debts_service_1.debtService.deletePayment(paymentId, userID);
            return (0, responses_1.sendSuccess)(res, result, "Pago eliminado con éxito");
        }
        catch (error) {
            next(error);
        }
    },
};
