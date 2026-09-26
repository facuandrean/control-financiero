"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtAccountController = void 0;
const responses_1 = require("../../../core/utils/responses");
const debts_accounts_service_1 = require("./debts-accounts.service");
exports.debtAccountController = {
    getAllDebtAccounts: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const allDebtAccounts = await debts_accounts_service_1.debtAccountService.getAllDebtAccounts(userID);
            return (0, responses_1.sendSuccess)(res, allDebtAccounts);
        }
        catch (error) {
            next(error);
        }
    },
    getDebtAccountById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const exists = await debts_accounts_service_1.debtAccountService.getDebtAccountById(id, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createDebtAccount: async (req, res, next) => {
        try {
            const data = req.body;
            const userID = req.user.id;
            const newDebtAccount = await debts_accounts_service_1.debtAccountService.createDebtAccount({
                ...data,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newDebtAccount);
        }
        catch (error) {
            next(error);
        }
    },
    updateDebtAccount: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await debts_accounts_service_1.debtAccountService.getDebtAccountById(id, userID);
            const data = req.body;
            const updatedDebtAccount = await debts_accounts_service_1.debtAccountService.updateDebtAccount(id, data);
            return (0, responses_1.sendSuccess)(res, updatedDebtAccount);
        }
        catch (error) {
            next(error);
        }
    },
    deactivateDebtAccount: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await debts_accounts_service_1.debtAccountService.getDebtAccountById(id, userID);
            const deactivatedDebtAccount = await debts_accounts_service_1.debtAccountService.deactivateDebtAccount(id);
            return (0, responses_1.sendSuccess)(res, deactivatedDebtAccount);
        }
        catch (error) {
            next(error);
        }
    },
    deleteDebtAccount: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            await debts_accounts_service_1.debtAccountService.getDebtAccountById(id, userID);
            await debts_accounts_service_1.debtAccountService.deleteDebtAccount(id);
            return (0, responses_1.sendSuccess)(res, null, "Deudor y todo su historial eliminados permanentemente");
        }
        catch (error) {
            next(error);
        }
    }
};
