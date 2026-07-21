import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../../core/utils/responses";
import { DebtAccount, CreateDebtAccountInput, NewDebtAccount, UpdateDebtAccountInput } from "./debts-accounts.types";
import { debtAccountService } from "./debts-accounts.service";

export const debtAccountController = {
  getAllDebtAccounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const allDebtAccounts: DebtAccount[] = await debtAccountService.getAllDebtAccounts(userID);
      return sendSuccess(res, allDebtAccounts);
    } catch (error) {
      next(error);
    }
  },

  getDebtAccountById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const exists = await debtAccountService.getDebtAccountById(id, userID);

      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createDebtAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateDebtAccountInput = req.body;
      const userID = req.user.id;

      const newDebtAccount: NewDebtAccount = await debtAccountService.createDebtAccount({
        ...data,
        userID,
      });

      return sendSuccess(res, newDebtAccount);
    } catch (error) {
      next(error);
    }
  },

  updateDebtAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      await debtAccountService.getDebtAccountById(id, userID);

      const data: UpdateDebtAccountInput = req.body;
      const updatedDebtAccount: DebtAccount = await debtAccountService.updateDebtAccount(id, data);
      return sendSuccess(res, updatedDebtAccount);
    } catch (error) {
      next(error);
    }
  },

  deactivateDebtAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      await debtAccountService.getDebtAccountById(id, userID);

      const deactivatedDebtAccount: DebtAccount = await debtAccountService.deactivateDebtAccount(id);
      return sendSuccess(res, deactivatedDebtAccount);
    } catch (error) {
      next(error);
    }
  },

  deleteDebtAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      await debtAccountService.getDebtAccountById(id, userID);

      await debtAccountService.deleteDebtAccount(id);
      return sendSuccess(res, null, "Deudor y todo su historial eliminados permanentemente");
    } catch (error) {
      next(error);
    }
  }
};
