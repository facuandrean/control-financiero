import { Response } from 'express';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (
  err: any,
  res: Response,
) => {
  // 1. Si el error es una instancia de nuestro AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      errorCode: err.errorCode || 'INTERNAL_ERROR',
      message: err.message,
    });
  }

  // 2. Errores específicos de librerías (ej. Zod o Drizzle)
  // Error de validación de Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      errorCode: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos',
      errors: err.errors, // Detalle de qué campo falló
    });
  }

  // 3. Error genérico (500)
  return res.status(500).json({
    status: 'error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Algo salió mal en el servidor',
  });
};