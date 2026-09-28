import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware para validar el esquema de una petición (body, params o query).
 * Si la validación falla, delega el error al globalErrorHandler.
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validamos el body contra el esquema de Zod y asignamos el resultado tipado/sanitizado
      req.body = await schema.parseAsync(req.body);
      
      next();
    } catch (error) {
      // Si Zod tira error, lo mandamos al manejador global
      // El manejador global ya tiene la lógica para formatear ZodError
      next(error);
    }
  };
};