import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "@core/utils/responses";
import { Transaction, CreateTransactionInput, NewTransaction, UpdateTransactionInput } from "./transactions.types";
import { transactionService } from "./transactions.service";

export const transactionController = {
  getAllTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const allTransactions: Transaction[] = await transactionService.getAllTransactions(userID);
      return sendSuccess(res, allTransactions);
    } catch (error) {
      next(error);
    }
  },

  getTransactionById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      
      const userID = req.user.id;
      const exists = await transactionService.getTransactionById(id, userID);

      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateTransactionInput = req.body;

      const userID = req.user.id;
      
      const newTransaction: NewTransaction = await transactionService.createTransaction({
        ...data,
        userID,
      });
      return sendSuccess(res, newTransaction);
    } catch (error) {
      next(error);
    }
  },

  updateTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await transactionService.getTransactionById(id, userID);

      const data: UpdateTransactionInput = req.body;
      
      const updatedTransaction: Transaction = await transactionService.updateTransaction(id, data);
      return sendSuccess(res, updatedTransaction);
    } catch (error) {
      next(error);
    }
  },

  revertTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await transactionService.getTransactionById(id, userID);

      const revertedTransaction: Transaction = await transactionService.revertTransaction(id);
      return sendSuccess(res, revertedTransaction);
    } catch (error) {
      next(error);
    }
  },
};

