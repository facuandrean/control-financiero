"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountController = void 0;
const responses_1 = require("../../core/utils/responses");
const accounts_service_1 = require("./accounts.service");
exports.accountController = {
    getAllAccounts: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const allAccounts = await accounts_service_1.accountService.getAllAccounts(userID);
            return (0, responses_1.sendSuccess)(res, allAccounts);
        }
        catch (error) {
            next(error);
        }
    },
    getAccountById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const exists = await accounts_service_1.accountService.getAccountById(id, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createAccount: async (req, res, next) => {
        try {
            const data = req.body;
            const userID = req.user.id;
            const newAccount = await accounts_service_1.accountService.createAccount({
                ...data,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newAccount);
        }
        catch (error) {
            next(error);
        }
    },
    updateAccount: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const data = req.body;
            const updatedAccount = await accounts_service_1.accountService.updateAccount(id, userID, data);
            return (0, responses_1.sendSuccess)(res, updatedAccount);
        }
        catch (error) {
            next(error);
        }
    },
    deactivateAccount: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const deactivatedAccount = await accounts_service_1.accountService.deactivateAccount(id, userID);
            return (0, responses_1.sendSuccess)(res, deactivatedAccount);
        }
        catch (error) {
            next(error);
        }
    },
};
