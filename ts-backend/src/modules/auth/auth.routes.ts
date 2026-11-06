import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validateLogin } from './auth.validation.js';

/**
 * Authentication Routes
 */
export class AuthRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get authenticated user
    this.router.get('/', authController.getUser.bind(authController));

    // Login
    this.router.post(
      '/login',
      validateLogin,
      authMiddleware.isLoggedOut.bind(authMiddleware),
      authController.login.bind(authController)
    );

    // Logout
    this.router.get(
      '/log-out',
      authMiddleware.isLoggedIn.bind(authMiddleware),
      authController.logout.bind(authController)
    );
  }
}

export const authRoutes = new AuthRoutes().router;
