import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../../shared/types/auth.types.js';
import { authService } from './auth.service.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  /**
   * Get authenticated user
   * @route GET /api/v1/auth
   */
  async getUser(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    return await authService.getAuthenticatedUser(req, res, next);
  }

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  async login(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    return await authService.login(req, res, next);
  }

  /**
   * Logout user
   * @route GET /api/v1/auth/log-out
   */
  async logout(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    return authService.logout(req, res, next);
  }
}

export const authController = new AuthController();
