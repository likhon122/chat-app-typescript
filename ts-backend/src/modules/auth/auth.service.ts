import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../../shared/types/auth.types.js';
import { userService } from '../user/user.service.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { JwtTokenUtil } from '../../utils/jwt.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';

/**
 * Authentication Service
 * Handles authentication business logic
 */
export class AuthService {
  /**
   * Authenticate user and get user info
   */
  async getAuthenticatedUser(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accessToken } = req.cookies as { accessToken?: string };

      if (!accessToken) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Access token not found, please login again!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
      }

      const userPayload = JwtTokenUtil.verifyToken<{ _id: string }>(
        accessToken,
        process.env.ACCESS_TOKEN_KEY!
      );

      const user = await userService.getUserByIdSafe(userPayload._id);

      if (!user) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Access token not valid, please login again!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
      }

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'User logged in successfully!',
        payload: { user },
        nextUrl: {},
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const existUser = await userService.getUserByEmail(email);

      if (!existUser) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'User is not registered with this email, please register first!',
          nextUrl: {
            register: '/api/v1/user/process-register',
            login: '/api/v1/auth/login',
          },
        });
      }

      const isPasswordValid = await userService.verifyPassword(password, existUser.password);

      if (!isPasswordValid) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'User email or password is incorrect!',
          nextUrl: {
            forgotPassword: '/api/v1/auth/forgot-password',
          },
        });
      }

      const userPayload = userService.prepareUserPayload(existUser);
      const formattedUser = userService.formatUserResponse(existUser);

      JwtTokenUtil.createAccessToken(res, userPayload);
      JwtTokenUtil.createRefreshToken(res, userPayload);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'User logged in successfully!',
        payload: { user: formattedUser },
        nextUrl: {},
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Logout user
   */
  logout(req: IAuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const { accessToken, refreshToken } = req.cookies as {
        accessToken?: string;
        refreshToken?: string;
      };

      if (!accessToken || !refreshToken) {
        ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'You are already logged out, please login first!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
        return;
      }

      JwtTokenUtil.clearAuthCookies(res);

      ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'User logged out successfully!',
        payload: {},
        nextUrl: { login: '/api/v1/auth/login' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authService = new AuthService();
