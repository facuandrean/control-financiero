import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../core/utils/responses";
import { Account, CreateAccountInput, NewAccount, UpdateAccountInput } from "./accounts.types";
import { accountService } from "./accounts.service";

export const accountController = {
  getAllAccounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const allAccounts: Account[] = await accountService.getAllAccounts(userID);
      return sendSuccess(res, allAccounts);
    } catch (error) {
      next(error);
    }
  },

  getAccountById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const exists = await accountService.getAccountById(id, userID);

      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateAccountInput = req.body;

      const userID = req.user.id;

      const newAccount: NewAccount = await accountService.createAccount({
        ...data,
        userID,
      });
      return sendSuccess(res, newAccount);
    } catch (error) {
      next(error);
    }
  },

  updateAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await accountService.getAccountById(id, userID);

      const data: UpdateAccountInput = req.body;
      
      const updatedAccount: Account = await accountService.updateAccount(id, data);
      return sendSuccess(res, updatedAccount);
    } catch (error) {
      next(error);
    }
  },

  deactivateAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await accountService.getAccountById(id, userID);

      const deactivatedAccount: Account = await accountService.deactivateAccount(id);
      return sendSuccess(res, deactivatedAccount);
    } catch (error) {
      next(error);
    }
  },
};

