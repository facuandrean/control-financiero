"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtItemController = void 0;
const responses_1 = require("../../../core/utils/responses");
const debts_items_service_1 = require("./debts-items.service");
exports.debtItemController = {
    getAllDebtItems: async (req, res, next) => {
        try {
            const debtAccountID = req.params.debtAccountID;
            const userID = req.user.id;
            const allDebtItems = await debts_items_service_1.debtItemService.getAllDebtItems(debtAccountID, userID);
            return (0, responses_1.sendSuccess)(res, allDebtItems);
        }
        catch (error) {
            next(error);
        }
    },
    getDebtItemById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const debtAccountID = req.params.debtAccountID;
            const userID = req.user.id;
            const exists = await debts_items_service_1.debtItemService.getDebtItemById(id, debtAccountID, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createDebtItem: async (req, res, next) => {
        try {
            const debtAccountID = req.params.debtAccountID;
            const data = req.body;
            const userID = req.user.id;
            const newDebtItem = await debts_items_service_1.debtItemService.createDebtItem({
                ...data,
                debtAccountID,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newDebtItem);
        }
        catch (error) {
            next(error);
        }
    },
    updateDebtItem: async (req, res, next) => {
        try {
            const id = req.params.id;
            const debtAccountID = req.params.debtAccountID;
            const userID = req.user.id;
            await debts_items_service_1.debtItemService.getDebtItemById(id, debtAccountID, userID);
            const data = req.body;
            const updatedDebtItem = await debts_items_service_1.debtItemService.updateDebtItem(id, debtAccountID, data);
            return (0, responses_1.sendSuccess)(res, updatedDebtItem);
        }
        catch (error) {
            next(error);
        }
    },
    deactivateDebtItem: async (req, res, next) => {
        try {
            const id = req.params.id;
            const debtAccountID = req.params.debtAccountID;
            const userID = req.user.id;
            await debts_items_service_1.debtItemService.getDebtItemById(id, debtAccountID, userID);
            const deactivatedDebtItem = await debts_items_service_1.debtItemService.deactivateDebtItem(id, debtAccountID, userID);
            return (0, responses_1.sendSuccess)(res, deactivatedDebtItem);
        }
        catch (error) {
            next(error);
        }
    },
};
