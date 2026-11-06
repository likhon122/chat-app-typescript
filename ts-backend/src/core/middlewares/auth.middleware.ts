import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedRequest, ISocketUser } from '../../shared/types/auth.types.js';
import { IAuthenticatedSocket } from '../../shared/types/socket.types.js';
import { JwtTokenUtil } from '../../utils/jwt.util.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { userRepository } from '../../modules/user/user.repository.js';
import { envConfig } from '../../config/environment.config.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';

/**
 * Authentication Middleware
 * Handles authentication and authorization checks
 */
export class AuthMiddleware {
  /**
   * Check if user is logged in
   */
  isLoggedIn(req: IAuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
      const { accessToken } = (req as any).cookies as { accessToken?: string };

      if (!accessToken) {
        ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Access token not found, please login again!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
        return;
      }

      const userInfo = JwtTokenUtil.verifyToken<{ _id: string }>(
        accessToken,
        envConfig.ACCESS_TOKEN_KEY
      );

      if (!userInfo) {
        ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Access token not valid, please login again!',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
        return;
      }

      req.userId = userInfo._id;
      next();
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req;

      if (!userId) {
        ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'User not found with access token, please login again',
          nextUrl: {
            login: '/api/v1/auth/login',
          },
        });
        return;
      }

      const user = await userRepository.findById(userId);

      if (!user?.isAdmin) {
        ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          errorMessage: 'You are not admin, access denied!',
          nextUrl: {},
        });
        return;
      }

      next();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Check if user is logged out
   */
  isLoggedOut(req: Request, res: Response, next: NextFunction): void {
    try {
      const { accessToken } = (req as any).cookies as { accessToken?: string };

      if (accessToken) {
        try {
          const userInfo = JwtTokenUtil.verifyToken(accessToken, envConfig.ACCESS_TOKEN_KEY);

          if (userInfo) {
            ResponseHandler.error(res, {
              statusCode: HTTP_STATUS.UNAUTHORIZED,
              errorMessage: 'You are already logged in, please logout first!',
              nextUrl: {
                logOut: '/api/v1/auth/log-out',
              },
            });
            return;
          }
        } catch (error) {
          // Token is invalid, continue
        }
      }

      next();
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Socket authentication middleware
   */
  socketAuthenticator(socket: IAuthenticatedSocket, next: (err?: Error) => void): void {
    try {
      const { accessToken } = socket.request.cookies as { accessToken?: string };

      if (!accessToken) {
        return next(new Error('Authentication error: Please login and send messages!'));
      }

      const userInfo = JwtTokenUtil.verifyToken<ISocketUser>(
        accessToken,
        envConfig.ACCESS_TOKEN_KEY
      );

      if (!userInfo) {
        return next(new Error('Authentication error: Please login and send messages!'));
      }

      socket.user = userInfo;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      return next(new Error('Authentication error: Please login and send messages!'));
    }
  }
}

export const authMiddleware = new AuthMiddleware();

// Export individual functions for backward compatibility
export const isLoggedIn = authMiddleware.isLoggedIn.bind(authMiddleware);
export const isAdmin = authMiddleware.isAdmin.bind(authMiddleware);
export const isLoggedOut = authMiddleware.isLoggedOut.bind(authMiddleware);
export const socketAuthenticator = authMiddleware.socketAuthenticator.bind(authMiddleware);
