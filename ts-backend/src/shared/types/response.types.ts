import { Response } from 'express';

/**
 * Standard API Response Structure
 */
export interface IApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  payload?: T;
  nextUrl?: Record<string, string>;
}

/**
 * Success Response Options
 */
export interface ISuccessResponseOptions<T = unknown> {
  statusCode: number;
  successMessage: string;
  payload?: T;
  nextUrl?: Record<string, string>;
}

/**
 * Error Response Options
 */
export interface IErrorResponseOptions {
  statusCode: number;
  errorMessage: string;
  nextUrl?: Record<string, string>;
}

/**
 * Response handler interface
 */
export interface IResponseHandler {
  success<T>(res: Response, options: ISuccessResponseOptions<T>): Response;
  error(res: Response, options: IErrorResponseOptions): Response;
}
