import { Response } from 'express';

/**
 * Envía una respuesta de éxito estandarizada.
 * @param res Objeto Response de Express
 * @param data Datos a enviar al cliente (puede ser un objeto, array o null)
 * @param message Mensaje descriptivo del éxito
 * @param statusCode Código de estado HTTP (por defecto 200)
 */
export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = "Operación exitosa",
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};