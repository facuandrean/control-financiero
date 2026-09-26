"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    // 1. Si el error es una instancia de nuestro AppError
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            errorCode: err.errorCode || 'INTERNAL_ERROR',
            message: err.message,
        });
    }
    // 2. Errores específicos de Zod
    if (err instanceof zod_1.ZodError) {
        const messages = err.issues.map((issue) => issue.message);
        return res.status(400).json({
            status: 'error',
            errorCode: 'VALIDATION_ERROR',
            message: messages.join('. '),
            errors: messages
        });
    }
    // 3. Error genérico (500)
    return res.status(500).json({
        status: 'error',
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Algo salió mal en el servidor',
    });
};
exports.globalErrorHandler = globalErrorHandler;
