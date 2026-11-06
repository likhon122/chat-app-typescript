import { body, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';

/**
 * Validation middleware for login
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

/**
 * Run validation and handle errors
 */
export const runValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => error.msg);

    return ResponseHandler.error(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorMessage: errorMessages.join(', '),
      nextUrl: {},
    });
  }

  next();
};
