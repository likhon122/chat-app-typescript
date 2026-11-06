import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../constants/app-constants.js';

/**
 * Run validation and handle errors
 * Middleware to check validation results and return errors if any
 */
export const runValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => error.msg);

    ResponseHandler.error(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorMessage: errorMessages.join(', '),
      nextUrl: {},
    });
    return;
  }

  next();
};
