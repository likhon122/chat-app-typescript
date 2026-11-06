import { body } from 'express-validator';
import { runValidation } from '../../shared/validation/runValidation.js';

/**
 * Validation for admin login
 */
export const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  runValidation,
];
