import { Request, Response, NextFunction } from 'express';
import {
  authenticateAdmin,
  getAllUsersWithStats,
  getAllMessages as getAllMessagesService,
  getAllChats as getAllChatsService,
  getDashboardStats as getDashboardStatsService,
} from './admin.service.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';
import { envConfig } from '../../config/environment.config.js';
import { catchAsync } from '../../utils/catch-async.util.js';
import { BadRequestError, UnauthorizedError } from '../../utils/errors.util.js';

/**
 * Admin login
 * @route POST /api/v1/admin/login
 */
export const adminLogin = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email) {
    throw new BadRequestError('Email is required!!');
  }

  if (!password) {
    throw new BadRequestError('Password is required!!');
  }

  const isAuthenticated = authenticateAdmin(
    email,
    password,
    envConfig.adminEmail,
    envConfig.adminPassword
  );

  if (!isAuthenticated) {
    throw new UnauthorizedError('You are not authorized to access admin panel. Please contact us!');
  }

  ResponseHandler.success(res, {
    statusCode: HTTP_STATUS.OK,
    successMessage: 'Admin login successfully!!',
    payload: {},
  });
});

/**
 * Get all users with statistics
 * @route GET /api/v1/admin/users
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };

  const allUsers = await getAllUsersWithStats(parseInt(page, 10), parseInt(limit, 10));

  ResponseHandler.success(res, {
    statusCode: HTTP_STATUS.OK,
    successMessage: 'All user details returned successfully!!',
    payload: { allUsers },
  });
});

/**
 * Get all messages
 * @route GET /api/v1/admin/messages
 */
export const getAllMessages = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };

    const allMessages = await getAllMessagesService(parseInt(page, 10), parseInt(limit, 10));

    ResponseHandler.success(res, {
      statusCode: HTTP_STATUS.OK,
      successMessage: 'All messages returned successfully!!',
      payload: { allMessages },
    });
  }
);

/**
 * Get all chats
 * @route GET /api/v1/admin/chats
 */
export const getAllChats = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };

  const chatDetails = await getAllChatsService(parseInt(page, 10), parseInt(limit, 10));

  ResponseHandler.success(res, {
    statusCode: HTTP_STATUS.OK,
    successMessage: 'All chats returned successfully!!',
    payload: { chatDetails },
  });
});

/**
 * Get dashboard statistics
 * @route GET /api/v1/admin/dashboard
 */
export const getDashboardStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const dashBoardDetails = await getDashboardStatsService();

    ResponseHandler.success(res, {
      statusCode: HTTP_STATUS.OK,
      successMessage: 'Dashboard details returned successfully!!',
      payload: { dashBoardDetails },
    });
  }
);
