import { Request, Response, NextFunction } from "express";
import { debtService } from "./debts.service";
import { sendSuccess } from "../../core/utils/responses";
import {
  CreateDebtDTO,
  UpdateDebtDTO,
  CreateMovementDTO,
  CreateDebtPaymentDTO,
} from "./debts.types";
import {
  createDebtSchema,
  createMovementSchema,
  createDebtPaymentSchema,
} from "./debts.validators";

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
      const data: CreateDebtDTO = createDebtSchema.parse(req.body);
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

  addMovement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const debtID = req.params.id as string;
      const userID = req.user.id;
      const validatedData: CreateMovementDTO = createMovementSchema.parse(req.body);
      const result = await debtService.addMovement(debtID, userID, validatedData);
      const message =
        validatedData.type === "PAYMENT"
          ? "Pago registrado con éxito"
          : "Cargo añadido con éxito";
      return sendSuccess(res, result, message, 201);
    } catch (error) {
      next(error);
    }
  },

  deleteMovement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movementId = (req.params.movementId || req.params.paymentId) as string;
      const userID = req.user.id;
      const result = await debtService.deleteMovement(movementId, userID);
      return sendSuccess(res, result, "Movimiento eliminado con éxito");
    } catch (error) {
      next(error);
    }
  },

  // Handler para soportar compatibilidad con rutas legadas de pago
  addLegacyPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const debtID = req.params.id as string;
      const userID = req.user.id;
      const legacyData: CreateDebtPaymentDTO = createDebtPaymentSchema.parse(req.body);
      const movementPayload: CreateMovementDTO = {
        type: "PAYMENT",
        amount: legacyData.amount,
        description: legacyData.notes || "Pago de deuda",
        date: legacyData.date || new Date().toISOString().split("T")[0],
        accountID: legacyData.accountID || undefined,
      };
      const result = await debtService.addMovement(debtID, userID, movementPayload);
      return sendSuccess(res, result, "Pago registrado con éxito", 201);
    } catch (error) {
      next(error);
    }
  },
};
