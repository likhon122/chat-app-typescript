/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Cookie Configuration
 */
export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'accessToken',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
  },
  REFRESH_TOKEN: {
    name: 'refreshToken',
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
  },
} as const;

/**
 * JWT Expiration Times
 */
export const JWT_EXPIRY = {
  ACCESS_TOKEN: '1d',
  REFRESH_TOKEN: '15d',
  RESET_PASSWORD: '15m',
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
} as const;
