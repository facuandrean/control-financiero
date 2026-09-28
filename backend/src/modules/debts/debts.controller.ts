import { Request, Response, NextFunction } from "express";
import { debtService } from "./debts.service";
import { sendSuccess } from "../../core/utils/responses";
import { CreateDebtDTO, UpdateDebtDTO, CreateDebtPaymentDTO } from "./debts.types";
import { createDebtPaymentSchema } from "./debts.validators";

export const debtController = {
  getAllDebts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const debts = await debtService.getDebts(userID);
      return sendSuccess(res, debts);
    } catch (error) {
      next(error);
    }
  },

  getDebtById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const debt = await debtService.getDebtById(id, userID);
      return sendSuccess(res, debt);
    } catch (error) {
      next(error);
    }
  },

  createDebt: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const data: CreateDebtDTO = req.body;
      const newDebt = await debtService.createDebt({ ...data, userID });
      return sendSuccess(res, newDebt, "Deuda creada con éxito", 201);
    } catch (error) {
      next(error);
    }
  },

  updateDebt: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      const data: UpdateDebtDTO = req.body;
      const updatedDebt = await debtService.updateDebt(id, userID, data);
      return sendSuccess(res, updatedDebt, "Deuda actualizada con éxito");
    } catch (error) {
      next(error);
    }
  },

  deleteDebt: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;
      await debtService.deleteDebt(id, userID);
      return sendSuccess(res, null, "Deuda eliminada con éxito");
    } catch (error) {
      next(error);
    }
  },

  addPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string; // debtID
      const userID = req.user.id;
      const validatedData: CreateDebtPaymentDTO = createDebtPaymentSchema.parse(req.body);
      const result = await debtService.addPayment(id, userID, validatedData);
      return sendSuccess(res, result, "Pago registrado con éxito", 201);
    } catch (error) {
      next(error);
    }
  },

  deletePayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentId = req.params.paymentId as string;
      const userID = req.user.id;
      const result = await debtService.deletePayment(paymentId, userID);
      return sendSuccess(res, result, "Pago eliminado con éxito");
    } catch (error) {
      next(error);
    }
  },
};
