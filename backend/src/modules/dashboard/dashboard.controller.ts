import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../core/utils/responses";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  getSummary: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userID = req.user.id;
      const { month, year } = req.query;

      const summary = await dashboardService.getSummary(
        userID,
        month ? String(month) : undefined,
        year ? String(year) : undefined
      );

      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  },
};
