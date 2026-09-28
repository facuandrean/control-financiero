"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityController = void 0;
const responses_1 = require("../../core/utils/responses");
const entities_service_1 = require("./entities.service");
exports.entityController = {
    getAllEntities: async (req, res, next) => {
        try {
            const userID = req.user.id;
            const allEntities = await entities_service_1.entityService.getAllEntities(userID);
            return (0, responses_1.sendSuccess)(res, allEntities);
        }
        catch (error) {
            next(error);
        }
    },
    getEntityById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const exists = await entities_service_1.entityService.getEntityById(id, userID);
            return (0, responses_1.sendSuccess)(res, exists);
        }
        catch (error) {
            next(error);
        }
    },
    createEntity: async (req, res, next) => {
        try {
            const data = req.body;
            const userID = req.user.id;
            const newEntity = await entities_service_1.entityService.createEntity({
                ...data,
                userID,
            });
            return (0, responses_1.sendSuccess)(res, newEntity);
        }
        catch (error) {
            next(error);
        }
    },
    updateEntity: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const data = req.body;
            const updatedEntity = await entities_service_1.entityService.updateEntity(id, userID, data);
            return (0, responses_1.sendSuccess)(res, updatedEntity);
        }
        catch (error) {
            next(error);
        }
    },
    deactivateEntity: async (req, res, next) => {
        try {
            const id = req.params.id;
            const userID = req.user.id;
            const deactivatedEntity = await entities_service_1.entityService.deactivateEntity(id, userID);
            return (0, responses_1.sendSuccess)(res, deactivatedEntity);
        }
        catch (error) {
            next(error);
        }
    }
};
