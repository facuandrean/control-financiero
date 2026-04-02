import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../core/utils/AppError";

interface JwtPayload {
  id: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Obtener el token directamente de las cookies
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new AppError("No autorizado: Token faltante", 401, "AUTH_NO_TOKEN");
    }

    // 2. Verificar el token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
      
      // 3. Inyectar el ID del usuario en el request para que los controladores lo usen
      req.user = { id: decoded.id };
      
      next();
    } catch (jwtError) {
      throw new AppError("Token inválido o expirado", 401, "AUTH_INVALID_TOKEN");
    }
  } catch (error) {
    next(error);
  }
};