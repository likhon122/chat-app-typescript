import { Router } from 'express';
import {
  adminLogin,
  getAllUsers,
  getAllMessages,
  getAllChats,
  getDashboardStats,
} from './admin.controller.js';
import { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validateAdminLogin } from './admin.validation.js';

/**
 * Admin Routes
 * Defines all routes for admin operations
 */
export class AdminRoutes {
  public router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Admin login
    this.router.post('/login', validateAdminLogin, adminLogin);

    // Get all users with statistics (admin only)
    this.router.get(
      '/users',
      this.authMiddleware.isLoggedIn,
      this.authMiddleware.isAdmin,
      getAllUsers
    );

    // Get all messages (admin only)
    this.router.get(
      '/messages',
      this.authMiddleware.isLoggedIn,
      this.authMiddleware.isAdmin,
      getAllMessages
    );

    // Get all chats (admin only)
    this.router.get(
      '/chats',
      this.authMiddleware.isLoggedIn,
      this.authMiddleware.isAdmin,
      getAllChats
    );

    // Get dashboard statistics (admin only)
    this.router.get(
      '/dashboard',
      this.authMiddleware.isLoggedIn,
      this.authMiddleware.isAdmin,
      getDashboardStats
    );
  }
}

export const adminRoutes = new AdminRoutes();
