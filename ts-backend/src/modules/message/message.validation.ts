import { body } from 'express-validator';
import { runValidation } from '../../shared/validation/runValidation.js';

/**
 * Validation for sending a new message
 */
export const validateSendMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  body('chat')
    .trim()
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID'),
  body('attachment').optional().isArray().withMessage('Attachments must be an array'),
  body('attachment.*').optional().isString().withMessage('Each attachment must be a string (URL)'),
  runValidation,
];
