import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../../shared/types/auth.types.js';
import { userService } from './user.service.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';
import { JwtTokenUtil } from '../../utils/jwt.util.js';
import { envConfig } from '../../config/environment.config.js';
import { sendEmail } from '../../utils/sendEmail.util.js';

/**
 * User Controller
 * Handles HTTP requests for user operations
 */
export class UserController {
  /**
   * Register a new user
   * @route POST /api/v1/user/register
   */
  async register(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, username, email, password, bio } = req.body;

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.CONFLICT,
          errorMessage: 'User with this email already exists!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
      }

      const existingUsername = await userService.getUserByUsername(username);
      if (existingUsername) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.CONFLICT,
          errorMessage: 'Username already taken!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
      }

      // Create user
      const user = await userService.createUser({
        name,
        username,
        email,
        password,
        bio,
      });

      const formattedUser = userService.formatUserResponse(user);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.CREATED,
        successMessage: 'User registered successfully!',
        payload: { user: formattedUser },
        nextUrl: {
          login: '/api/v1/auth/login',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get user profile
   * @route GET /api/v1/user/profile/:id?
   */
  async getProfile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'User ID is required',
        });
      }

      const user = await userService.getUserByIdSafe(userId);

      if (!user) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'User not found',
        });
      }

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'User profile retrieved successfully!',
        payload: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/user/profile
   */
  async updateProfile(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { name, username, bio } = req.body;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;

      const updatedUser = await userService.updateUser(userId, updateData);

      if (!updatedUser) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'User not found',
        });
      }

      const formattedUser = userService.formatUserResponse(updatedUser);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Profile updated successfully!',
        payload: { user: formattedUser },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search users
   * @route GET /api/v1/user/search
   */
  async searchUsers(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const userId = req.userId;

      if (!q || typeof q !== 'string') {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'Search query is required',
        });
      }

      const users = await userService.searchUsers(q, userId);

      const formattedUsers = users.map((user) => userService.formatUserResponse(user));

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Users found successfully!',
        payload: { users: formattedUsers },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all users
   * @route GET /api/v1/user/all
   */
  async getAllUsers(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      const formattedUsers = users.map((user) => userService.formatUserResponse(user));

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Users retrieved successfully!',
        payload: { users: formattedUsers },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Forgot Password
   * @route POST /api/v1/user/forgot-password
   */
  async forgotPassword(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'Email is required',
        });
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        // Return success even if user not found to prevent email enumeration
        return ResponseHandler.success(res, {
          statusCode: HTTP_STATUS.OK,
          successMessage: 'If an account with that email exists, a password reset link has been sent.',
        });
      }

      const resetToken = JwtTokenUtil.createToken(
        { id: user._id },
        envConfig.RESET_PASSWORD_KEY,
        '15m'
      );

      const resetUrl = `${envConfig.FRONTEND_URL1}/reset-password/${resetToken}`;
      const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Password Reset',
          message,
        });

        return ResponseHandler.success(res, {
          statusCode: HTTP_STATUS.OK,
          successMessage: 'Sending a verification mail...',
        });
      } catch (error) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          errorMessage: 'Email could not be sent',
        });
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Reset Password
   * @route PUT /api/v1/user/reset-password
   */
  async resetPassword(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'Token and password are required',
        });
      }

      let decoded: any;
      try {
        decoded = JwtTokenUtil.verifyToken(token, envConfig.RESET_PASSWORD_KEY);
      } catch (error) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'Invalid or expired reset token',
        });
      }

      const user = await userService.getUserById(decoded.id);
      if (!user) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorMessage: 'Invalid token user',
        });
      }

      await userService.updateUserPassword(user._id, password);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Password reset successfully!! Redirecting to you in login page !!',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const userController = new UserController();
