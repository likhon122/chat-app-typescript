import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { envConfig } from '../config/environment.config.js';
import { COOKIE_CONFIG, JWT_EXPIRY } from '../shared/constants/app-constants.js';
import { IUserPayload } from '../shared/types/auth.types.js';

/**
 * JWT Token Management Utility
 */
export class JwtTokenUtil {
  /**
   * Create a generic JWT token
   */
  public static createToken(
    payload: Record<string, unknown>,
    secretKey: string,
    expiresIn: string | number
  ): string {
    if (typeof payload !== 'object') {
      throw new Error('Token payload must be an object');
    }
    if (typeof secretKey !== 'string') {
      throw new Error('Secret key must be a string');
    }
    if (!expiresIn) {
      throw new Error('Expiration time is required');
    }

    try {
      // Use type assertion to work around strict StringValue type in jwt types
      return jwt.sign(payload, secretKey, { expiresIn } as SignOptions);
    } catch (error) {
      throw new Error(`Failed to create token: ${(error as Error).message}`);
    }
  }

  /**
   * Verify JWT token
   */
  public static verifyToken<T = unknown>(token: string, secretKey: string): T {
    const decoded = jwt.verify(token, secretKey);
    if (!decoded) {
      throw new Error('Token verification failed');
    }
    return decoded as T;
  }

  /**
   * Create and set access token cookie
   */
  public static createAccessToken(res: Response, user: IUserPayload): void {
    try {
      const accessToken = jwt.sign({ ...user }, envConfig.ACCESS_TOKEN_KEY, {
        expiresIn: JWT_EXPIRY.ACCESS_TOKEN,
      });

      res.cookie(COOKIE_CONFIG.ACCESS_TOKEN.name, accessToken, {
        maxAge: COOKIE_CONFIG.ACCESS_TOKEN.maxAge,
        httpOnly: COOKIE_CONFIG.ACCESS_TOKEN.httpOnly,
        secure: COOKIE_CONFIG.ACCESS_TOKEN.secure,
        sameSite: COOKIE_CONFIG.ACCESS_TOKEN.sameSite,
      });
    } catch (error) {
      throw new Error(`Failed to create access token: ${(error as Error).message}`);
    }
  }

  /**
   * Create and set refresh token cookie
   */
  public static createRefreshToken(res: Response, user: IUserPayload): void {
    try {
      const refreshToken = jwt.sign({ ...user }, envConfig.REFRESH_TOKEN_KEY, {
        expiresIn: JWT_EXPIRY.REFRESH_TOKEN,
      });

      res.cookie(COOKIE_CONFIG.REFRESH_TOKEN.name, refreshToken, {
        maxAge: COOKIE_CONFIG.REFRESH_TOKEN.maxAge,
        httpOnly: COOKIE_CONFIG.REFRESH_TOKEN.httpOnly,
        secure: COOKIE_CONFIG.REFRESH_TOKEN.secure,
        sameSite: COOKIE_CONFIG.REFRESH_TOKEN.sameSite,
      });
    } catch (error) {
      throw new Error(`Failed to create refresh token: ${(error as Error).message}`);
    }
  }

  /**
   * Clear authentication cookies
   */
  public static clearAuthCookies(res: Response): void {
    res.clearCookie(COOKIE_CONFIG.ACCESS_TOKEN.name, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN.name, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }
}

// Legacy function exports
export const createJsonWebToken = (
  tokenData: Record<string, unknown>,
  secretKey: string,
  expireTime: string
) => JwtTokenUtil.createToken(tokenData, secretKey, expireTime);

export const verifyJsonWebToken = <T = unknown>(token: string, secretKey: string) =>
  JwtTokenUtil.verifyToken<T>(token, secretKey);

export const createAccessToken = (res: Response, user: IUserPayload) =>
  JwtTokenUtil.createAccessToken(res, user);

export const createRefreshToken = (res: Response, user: IUserPayload) =>
  JwtTokenUtil.createRefreshToken(res, user);
