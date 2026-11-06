import { body } from 'express-validator';
import { runValidation } from '../../shared/validation/runValidation.js';

/**
 * Validation for creating a new chat
 */
export const validateCreateChat = [
  body('chatName')
    .trim()
    .notEmpty()
    .withMessage('Chat name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Chat name must be between 2 and 100 characters'),
  body('groupChat').isBoolean().withMessage('groupChat must be a boolean'),
  body('members').isArray({ min: 1 }).withMessage('At least one member is required'),
  body('members.*').isMongoId().withMessage('Invalid member ID'),
  runValidation,
];

/**
 * Validation for adding member to chat
 */
export const validateAddMember = [
  body('memberId')
    .trim()
    .notEmpty()
    .withMessage('Member ID is required')
    .isMongoId()
    .withMessage('Invalid member ID'),
  runValidation,
];

/**
 * Validation for updating chat name
 */
export const validateUpdateChatName = [
  body('chatName')
    .trim()
    .notEmpty()
    .withMessage('Chat name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Chat name must be between 2 and 100 characters'),
  runValidation,
];
