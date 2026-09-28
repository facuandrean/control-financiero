"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const categories_service_1 = require("./categories.service");
const responses_1 = require("../../core/utils/responses");
exports.categoryController = {
    getAllCategories: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const allCategories = await categories_service_1.categoryService.getAllCategories(userID);
            return (0, responses_1.sendSuccess)(res, allCategories);
        }
        catch (error) {
            next(error);
        }
    },
    getCategoryById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const exists = await categories_service_1.categoryService.getCategoryById(id, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createCategory: async (req, res, next) => {
        try {
            const data = req.body;
            const userID = req.user.id;
            const newCategory = await categories_service_1.categoryService.createCategory({
                ...data,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newCategory);
        }
        catch (error) {
            next(error);
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const data = req.body;
            const updatedCategory = await categories_service_1.categoryService.updateCategory(id, userID, data);
            return (0, responses_1.sendSuccess)(res, updatedCategory);
        }
        catch (error) {
            next(error);
        }
    },
    deactivateCategory: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const deactivatedCategory = await categories_service_1.categoryService.deactivateCategory(id, userID);
            return (0, responses_1.sendSuccess)(res, deactivatedCategory);
        }
        catch (error) {
            next(error);
        }
    }
};
