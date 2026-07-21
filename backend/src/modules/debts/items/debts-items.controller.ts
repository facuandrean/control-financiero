import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../../core/utils/responses";
import { DebtItem, CreateDebtItemInput, UpdateDebtItemInput } from "./debts-items.types";
import { debtItemService } from "./debts-items.service";

export const debtItemController = {
  getAllDebtItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const debtAccountID = req.params.debtAccountID as string;
      const userID = req.user.id;
      const allDebtItems: DebtItem[] = await debtItemService.getAllDebtItems(debtAccountID, userID);
      return sendSuccess(res, allDebtItems);
    } catch (error) {
      next(error);
    }
  },

  getDebtItemById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const debtAccountID = req.params.debtAccountID as string;
      const userID = req.user.id;

      const exists = await debtItemService.getDebtItemById(id, debtAccountID, userID);
      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createDebtItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const debtAccountID = req.params.debtAccountID as string;
      const data: CreateDebtItemInput = req.body;
      const userID = req.user.id;

      const newDebtItem: DebtItem = await debtItemService.createDebtItem({
        ...data,
        debtAccountID,
        userID,
      });
      return sendSuccess(res, newDebtItem);
    } catch (error) {
      next(error);
    }
  },

  updateDebtItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const debtAccountID = req.params.debtAccountID as string;
      const userID = req.user.id;

      await debtItemService.getDebtItemById(id, debtAccountID, userID);

      const data: UpdateDebtItemInput = req.body;
      const updatedDebtItem: DebtItem = await debtItemService.updateDebtItem(id, debtAccountID, data);
      return sendSuccess(res, updatedDebtItem);
    } catch (error) {
      next(error);
    }
  },

  deactivateDebtItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const debtAccountID = req.params.debtAccountID as string;
      const userID = req.user.id;

      await debtItemService.getDebtItemById(id, debtAccountID, userID);

      const deactivatedDebtItem: DebtItem = await debtItemService.deactivateDebtItem(id, debtAccountID, userID);
      return sendSuccess(res, deactivatedDebtItem);
    } catch (error) {
      next(error);
    }
  },
};
