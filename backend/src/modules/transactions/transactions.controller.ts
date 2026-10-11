import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../core/utils/responses";
import { transactionService } from "./transactions.service";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "./transactions.validators";

export const transactionController = {
  getAllTransactions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userID = req.user.id;
      const { month, year, accountID, type } = req.query;

      const transactions = await transactionService.getAllTransactions(userID, {
        month: month ? String(month) : undefined,
        year: year ? String(year) : undefined,
        accountID: accountID ? String(accountID) : undefined,
        type: type ? String(type) : undefined,
      });

      return sendSuccess(res, transactions);
    } catch (error) {
      next(error);
    }
  },

  getTransactionById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const transaction = await transactionService.getTransactionById(
        id,
        userID
      );

      return sendSuccess(res, transaction);
    } catch (error) {
      next(error);
    }
  },

  createTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userID = req.user.id;
      const validatedData = createTransactionSchema.parse(req.body);

      const newTransaction = await transactionService.createTransaction({
        ...validatedData,
        userID,
      });

      return sendSuccess(res, newTransaction, "Transacción creada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  },

  updateTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const validatedData = updateTransactionSchema.parse(req.body);

      const updatedTransaction = await transactionService.updateTransaction(
        id,
        userID,
        validatedData
      );

      return sendSuccess(res, updatedTransaction);
    } catch (error) {
      next(error);
    }
  },

  deleteTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      await transactionService.deleteTransaction(id, userID);

      return sendSuccess(res, {
        message: "Transacción eliminada correctamente",
      });
    } catch (error) {
      next(error);
    }
  },

  payInstallment: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const accountId = (req.body.accountID || req.body.accountId) as string;

      const result = await transactionService.payInstallment(
        id,
        accountId,
        userID
      );

      return sendSuccess(res, result, "Cuota pagada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  },

  unpayInstallment: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      const result = await transactionService.unpayInstallment(id, userID);

      return sendSuccess(res, result, "Pago de cuota deshecho exitosamente", 200);
    } catch (error) {
      next(error);
    }
  },

  getPendingInstallments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userID = req.user.id;
      const { month, year } = req.query;

      const pendingInstallments =
        await transactionService.getPendingInstallments(
          userID,
          month ? String(month) : undefined,
          year ? String(year) : undefined
        );

      return sendSuccess(res, pendingInstallments);
    } catch (error) {
      next(error);
    }
  },
};
