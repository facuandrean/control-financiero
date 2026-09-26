"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Clase personalizada para manejar errores operativos de la aplicación.
 * Permite capturar el mensaje, el status code y un código de error interno.
 */
class AppError extends Error {
    statusCode;
    errorCode;
    isOperational;
    constructor(message, statusCode = 500, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        // Marcamos el error como 'operacional' para diferenciarlo de errores de programación o del sistema
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
