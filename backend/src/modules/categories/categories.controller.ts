import { NextFunction, Request, Response } from "express";
import { Category, CreateCategoryInput, NewCategory, UpdateCategoryInput } from "./categories.types";
import { categoryService } from "./categories.service";
import { sendSuccess } from "../../core/utils/responses";

export const categoryController = {
  getAllCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const allCategories: Category[] = await categoryService.getAllCategories(userID);
      return sendSuccess(res, allCategories);
    } catch (error) {
      next(error);
    }
  },

  getCategoryById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userID = req.user.id;

      const exists = await categoryService.getCategoryById(id, userID);

      return sendSuccess(res, exists);
    } catch (error) {
      next(error);
    }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateCategoryInput = req.body;

      const userID = req.user.id;
      
      const newCategory: NewCategory = await categoryService.createCategory({
        ...data,
        userID,
      });
      return sendSuccess(res, newCategory);
    } catch (error) {
      next(error);
    }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await categoryService.getCategoryById(id, userID);

      const data: UpdateCategoryInput = req.body;
      
      const updatedCategory: Category = await categoryService.updateCategory(id, data);
      return sendSuccess(res, updatedCategory);
    } catch (error) {
      next(error);
    }
  },

  deactivateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const userID = req.user.id;
      await categoryService.getCategoryById(id, userID);

      const deactivatedCategory: Category = await categoryService.deactivateCategory(id);
      return sendSuccess(res, deactivatedCategory);
    } catch (error) {
      next(error);
    }
  }
}