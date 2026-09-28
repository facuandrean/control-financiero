import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { authService } from './auth.service';
import { userService } from '../users/users.service';
import { sendSuccess } from '../../core/utils/responses';
import { AppError } from '../../core/utils/AppError';
import { sessions } from './auth.schema';
import { db } from '../../core/db/db';
import { eq } from 'drizzle-orm';

export const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', cookieBaseOptions);
  res.clearCookie('refreshToken', cookieBaseOptions);
};

export const authController = {
  // POST /register
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, lastName } = req.body;
      const publicUser = await authService.register({ name, lastName, email, password });
      return sendSuccess(res, publicUser, "Usuario registrado con éxito", 201);
    } catch (error) {
      next(error);
    }
  },

  // POST /login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await userService.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Email o contraseña incorrectos", 401, "AUTH_INVALID_CREDENTIALS");
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const { accessToken, refreshToken } = await authService.createSession(user.id, userAgent, ipAddress);

      res.cookie('accessToken', accessToken, {
        ...cookieBaseOptions,
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieBaseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      const { password: _, ...publicUser } = user;

      return sendSuccess(res, { user: publicUser }, "Login exitoso");
    } catch (error) {
      next(error);
    }
  },

  // POST /refresh
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        clearAuthCookies(res);
        throw new AppError("No se proporcionó Refresh Token", 401, "AUTH_NO_TOKEN");
      }

      const { accessToken } = await authService.validateRefreshToken(refreshToken);

      // Actualizamos la cookie del Access Token
      res.cookie('accessToken', accessToken, {
        ...cookieBaseOptions,
        maxAge: 15 * 60 * 1000
      });

      return sendSuccess(res, null, "Token actualizado con éxito");
    } catch (error) {
      clearAuthCookies(res);
      next(error);
    }
  },

  // POST /logout
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        const hashed = authService.hashToken(refreshToken);
        await db.delete(sessions).where(eq(sessions.tokenHashed, hashed));
      }

      // Limpiamos AMBAS cookies con sus opciones completas
      clearAuthCookies(res);
      
      return sendSuccess(res, null, "Sesión cerrada correctamente");
    } catch (error) {
      clearAuthCookies(res);
      next(error);
    }
  },

  // POST /google
  googleLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const { user, accessToken, refreshToken, sessionToken } = await authService.googleLogin(token, userAgent, ipAddress);

      res.cookie('accessToken', accessToken, {
        ...cookieBaseOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieBaseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { user, sessionToken }, "Inicio de sesión con Google exitoso");
    } catch (error) {
      next(error);
    }
  }
};