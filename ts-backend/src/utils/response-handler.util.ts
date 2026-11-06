import { Response } from 'express';
import {
  ISuccessResponseOptions,
  IErrorResponseOptions,
  IApiResponse,
} from '../shared/types/response.types.js';

/**
 * Response Handler Utility
 * Provides consistent API response formatting
 */
export class ResponseHandler {
  /**
   * Send success response
   */
  public static success<T>(res: Response, options: ISuccessResponseOptions<T>): Response {
    const response: IApiResponse<T> = {
      statusCode: options.statusCode,
      message: options.successMessage,
      payload: options.payload,
      nextUrl: options.nextUrl,
    };

    return res.status(options.statusCode).json(response);
  }

  /**
   * Send error response
   */
  public static error(res: Response, options: IErrorResponseOptions): Response {
    const response: IApiResponse = {
      statusCode: options.statusCode,
      message: options.errorMessage,
      nextUrl: options.nextUrl,
    };

    return res.status(options.statusCode).json(response);
  }
}

// Legacy function exports for backward compatibility
export const successResponse = <T>(res: Response, options: ISuccessResponseOptions<T>) =>
  ResponseHandler.success(res, options);

export const errorResponse = (res: Response, options: IErrorResponseOptions) =>
  ResponseHandler.error(res, options);
