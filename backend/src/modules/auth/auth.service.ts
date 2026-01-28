import { db } from '@core/db/db';
import { config } from 'config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sessions } from './auth.schema';
import { eq, sql } from 'drizzle-orm';
import { AppError } from '@core/utils/AppError';

export const authService = {
  // Genera un string aleatorio que será el Refresh Token
  generateRefreshToken: (): string => {
    return crypto.randomBytes(40).toString('hex');
  },

  // Hasheamos el token para guardarlo en la base de datos
  hashToken: (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  // Creamos la sesión y devolvemos los tokens al controlador
  createSession: async (userID: string, userAgent: string, ipAddress: string) => {
    const accessToken = jwt.sign(
      { id: userID }, 
      config.accessTokenSecret!, 
      { expiresIn: "15m" }
    );

    const refreshToken = authService.generateRefreshToken();
    const tokenHashed = authService.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    await db.insert(sessions).values({
      id: crypto.randomUUID(),
      userID: userID,
      tokenHashed,
      userAgent,
      ipAddress,
      expiresAt,
      createdAt: sql`CURRENT_TIMESTAMP`,
    });

    return { accessToken, refreshToken };
  },

  // Validamos el refresh token y creamos un nuevo access token
  validateRefreshToken: async (refreshToken: string) => {
    const hashed = authService.hashToken(refreshToken);

    const sessionData = await db.select().from(sessions).where(eq(sessions.tokenHashed, hashed)).get();

    if (!sessionData) {
      throw new AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
    }

    if (new Date(sessionData.expiresAt) < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, sessionData.id));
      throw new AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
    }

    const accessToken = jwt.sign({ id: sessionData.userID }, config.accessTokenSecret!, { expiresIn: "15m" });

    return { accessToken };
  }
}