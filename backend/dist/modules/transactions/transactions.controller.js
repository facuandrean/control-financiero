"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const responses_1 = require("../../core/utils/responses");
const transactions_service_1 = require("./transactions.service");
exports.transactionController = {
    getAllTransactions: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const allTransactions = await transactions_service_1.transactionService.getAllTransactions(userID);
            return (0, responses_1.sendSuccess)(res, allTransactions);
        }
        catch (error) {
            next(error);
        }
    },
    getTransactionById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const exists = await transactions_service_1.transactionService.getTransactionById(id, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createTransaction: async (req, res, next) => {
        try {
            const data = req.body;
            const userID = req.user.id;
            const newTransaction = await transactions_service_1.transactionService.createTransaction({
                ...data,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newTransaction);
        }
        catch (error) {
            next(error);
        }
    },
    updateTransaction: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await transactions_service_1.transactionService.getTransactionById(id, userID);
            const data = req.body;
            const updatedTransaction = await transactions_service_1.transactionService.updateTransaction(id, data);
            return (0, responses_1.sendSuccess)(res, updatedTransaction);
        }
        catch (error) {
            next(error);
        }
    },
};
