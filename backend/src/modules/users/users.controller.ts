import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { userService } from './users.service';
import { sendSuccess } from '../../core/utils/responses';
import { AppError } from '../../core/utils/AppError';
import { UpdateUserInput, ChangePasswordInput } from './users.types';

export const userController = {
  // GET /me
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const user = await userService.getUserById(userID);

      const { password, ...publicProfile } = user;

      return sendSuccess(res, publicProfile);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /me
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const updateData: UpdateUserInput = req.body;

      const currentUser = await userService.getUserById(userID);

      if (updateData.email && updateData.email !== currentUser.email) {
        const isRepeatedEmail = await userService.findByEmail(updateData.email);
        if (isRepeatedEmail) {
          throw new AppError("El mail ya está en uso", 409, "EMAIL_ALREADY_EXISTS");
        }
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await userService.updateUser(userID, updateData);
      const { password, ...publicProfile } = updatedUser;

      return sendSuccess(res, publicProfile, "Perfil actualizado con éxito");
    } catch (error) {
      next(error);
    }
  },

  // POST /change-password
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      const { currentPassword, newPassword }: ChangePasswordInput = req.body;

      const user = await userService.getUserById(userID);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new AppError("La contraseña actual es incorrecta", 401, "INVALID_PASSWORD");
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await userService.updateUser(userID, { password: hashedNewPassword });

      return sendSuccess(res, null, "Contraseña actualizada con éxito");
    } catch (error) {
      next(error);
    }
  },

  // DELETE /me
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = req.user.id;
      
      await userService.deleteUser(userID);
      
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return sendSuccess(res, null, "Cuenta eliminada correctamente");
    } catch (error) {
      next(error);
    }
  }
};