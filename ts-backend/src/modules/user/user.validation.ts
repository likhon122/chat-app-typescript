import { body, ValidationChain } from 'express-validator';
import { VALIDATION } from '../../shared/constants/app-constants.js';

/**
 * Validation for user registration
 */
export const validateRegister: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`
    ),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: VALIDATION.USERNAME_MIN_LENGTH, max: VALIDATION.USERNAME_MAX_LENGTH })
    .withMessage(
      `Username must be between ${VALIDATION.USERNAME_MIN_LENGTH} and ${VALIDATION.USERNAME_MAX_LENGTH} characters`
    )
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

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
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.BIO_MAX_LENGTH })
    .withMessage(`Bio cannot exceed ${VALIDATION.BIO_MAX_LENGTH} characters`),
];

/**
 * Validation for profile update
 */
export const validateUpdateProfile: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`
    ),

  body('username')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.USERNAME_MIN_LENGTH, max: VALIDATION.USERNAME_MAX_LENGTH })
    .withMessage(
      `Username must be between ${VALIDATION.USERNAME_MIN_LENGTH} and ${VALIDATION.USERNAME_MAX_LENGTH} characters`
    )
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.BIO_MAX_LENGTH })
    .withMessage(`Bio cannot exceed ${VALIDATION.BIO_MAX_LENGTH} characters`),
];
