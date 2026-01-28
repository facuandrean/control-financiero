import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "@core/utils/responses";
import { Entity, CreateEntityInput, NewEntity, UpdateEntityInput } from "./entities.types";
import { entityService } from "./entities.service";

export const entityController = {
  getAllEntities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allEntities: Entity[] = await entityService.getAllEntities();
      return sendSuccess(res, allEntities);
    } catch (error) {
      next(error);
    }
  },

  getEntityById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const exists = await entityService.getEntityById(id);

      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createEntity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateEntityInput = req.body;

      const userID = req.user.id;
      
      const newEntity: NewEntity = await entityService.createEntity({
        ...data,
        userID,
      });
      return sendSuccess(res, newEntity);
    } catch (error) {
      next(error);
    }
  },

  updateEntity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await entityService.getEntityById(id);

      const data: UpdateEntityInput = req.body;
      
      const updatedEntity: Entity = await entityService.updateEntity(id, data);
      return sendSuccess(res, updatedEntity);
    } catch (error) {
      next(error);
    }
  },

  deactivateEntity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      await entityService.getEntityById(id);

      const deactivatedEntity: Entity = await entityService.deactivateEntity(id);
      return sendSuccess(res, deactivatedEntity);
    } catch (error) {
      next(error);
    }
  }
};

