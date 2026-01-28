import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../core/utils/AppError";

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No autorizado: Token faltante", 401, "AUTH_NO_TOKEN");
    }

    const token = authHeader.split(" ")[1];

    // Verificar el token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
      
      // Inyectar el ID del usuario en el request para que los controladores lo usen
      req.user = { id: decoded.id };
      
      next();
    } catch (jwtError) {
      throw new AppError("Token inválido o expirado", 401, "AUTH_INVALID_TOKEN");
    }
  } catch (error) {
    next(error);
  }
}; 