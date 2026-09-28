"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const responses_1 = require("../../core/utils/responses");
const dashboard_service_1 = require("./dashboard.service");
exports.dashboardController = {
    getSummary: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const { month, year } = req.query;
            const summary = await dashboard_service_1.dashboardService.getSummary(userID, month ? String(month) : undefined, year ? String(year) : undefined);
            return (0, responses_1.sendSuccess)(res, summary);
        }
        catch (error) {
            next(error);
        }
    },
};
