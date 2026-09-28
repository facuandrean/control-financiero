"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const responses_1 = require("../../core/utils/responses");
const transactions_service_1 = require("./transactions.service");
const transactions_validators_1 = require("./transactions.validators");
exports.transactionController = {
    getAllTransactions: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const { month, year, accountID, type } = req.query;
            const transactions = await transactions_service_1.transactionService.getAllTransactions(userID, {
                month: month ? String(month) : undefined,
                year: year ? String(year) : undefined,
                accountID: accountID ? String(accountID) : undefined,
                type: type ? String(type) : undefined,
            });
            return (0, responses_1.sendSuccess)(res, transactions);
        }
        catch (error) {
            next(error);
        }
    },
    getTransactionById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const transaction = await transactions_service_1.transactionService.getTransactionById(id, userID);
            return (0, responses_1.sendSuccess)(res, transaction);
        }
        catch (error) {
            next(error);
        }
    },
    createTransaction: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const validatedData = transactions_validators_1.createTransactionSchema.parse(req.body);
            const newTransaction = await transactions_service_1.transactionService.createTransaction({
                ...validatedData,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newTransaction, "Transacción creada exitosamente", 201);
        }
        catch (error) {
            next(error);
        }
    },
    updateTransaction: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const validatedData = transactions_validators_1.updateTransactionSchema.parse(req.body);
            const updatedTransaction = await transactions_service_1.transactionService.updateTransaction(id, userID, validatedData);
            return (0, responses_1.sendSuccess)(res, updatedTransaction);
        }
        catch (error) {
            next(error);
        }
    },
    deleteTransaction: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await transactions_service_1.transactionService.deleteTransaction(id, userID);
            return (0, responses_1.sendSuccess)(res, {
                message: "Transacción eliminada correctamente",
            });
        }
        catch (error) {
            next(error);
        }
    },
};
