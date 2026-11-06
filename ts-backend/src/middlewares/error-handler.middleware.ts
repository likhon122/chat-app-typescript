import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.util.js';
import { envConfig } from '../config/environment.config.js';

/**
 * Standard Error Response Interface
 */
interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: any[];
  stack?: string;
}

/**
 * Format Zod Validation Errors
 */
const formatZodError = (error: ZodError): string[] => {
  return error.issues.map((err: any) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
};

/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized response
 */
export const globalErrorHandler = (
  err: Error | AppError | ZodError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Handle operational errors (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = formatZodError(err);
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values((err as any).errors).map((e: any) => e.message);
  }
  // Handle Mongoose cast errors
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${(err as any).path}: ${(err as any).value}`;
  }
  // Handle Mongoose duplicate key errors
  else if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    statusCode = 409;
    message = `Duplicate field value: ${field}. Please use another value`;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    statusCode,
    message,
  };

  // Add validation errors if any
  if (errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Add stack trace in development
  if (envConfig.isDevelopment()) {
    errorResponse.stack = err.stack;
  }

  // Log error in development
  if (envConfig.isDevelopment()) {
    console.error('💥 ERROR:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 Not Found
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
  });
};
