import { Router } from 'express';
import { userController } from './user.controller.js';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validateRegister, validateUpdateProfile } from './user.validation.js';

/**
 * User Routes
 */
export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Register user
    this.router.post(
      '/register',
      validateRegister,
      authMiddleware.isLoggedOut.bind(authMiddleware),
      userController.register.bind(userController)
    );

    // Get user profile (own or others)
    this.router.get(
      '/profile/:id?',
      authMiddleware.isLoggedIn.bind(authMiddleware),
      userController.getProfile.bind(userController)
    );

    // Update user profile
    this.router.put(
      '/profile',
      authMiddleware.isLoggedIn.bind(authMiddleware),
      validateUpdateProfile,
      userController.updateProfile.bind(userController)
    );

    // Search users
    this.router.get(
      '/search',
      authMiddleware.isLoggedIn.bind(authMiddleware),
      userController.searchUsers.bind(userController)
    );

    // Get all users
    this.router.get(
      '/all',
      authMiddleware.isLoggedIn.bind(authMiddleware),
      userController.getAllUsers.bind(userController)
    );

    // Forgot password
    this.router.post(
      '/forgot-password',
      userController.forgotPassword.bind(userController)
    );

    // Reset password
    this.router.put(
      '/reset-password',
      userController.resetPassword.bind(userController)
    );
  }
}

export const userRoutes = new UserRoutes().router;
