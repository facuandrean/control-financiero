"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
/**
 * Envía una respuesta de éxito estandarizada.
 * @param res Objeto Response de Express
 * @param data Datos a enviar al cliente (puede ser un objeto, array o null)
 * @param message Mensaje descriptivo del éxito
 * @param statusCode Código de estado HTTP (por defecto 200)
 */
const sendSuccess = (res, data = null, message = "Operación exitosa", statusCode = 200) => {
    return res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
