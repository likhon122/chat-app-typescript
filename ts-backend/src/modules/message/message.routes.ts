import { Router } from 'express';
import { messageController } from './message.controller.js';
import { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';
import { validateSendMessage } from './message.validation.js';

/**
 * Message Routes
 * Defines all routes for message operations
 */
export class MessageRoutes {
  public router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get messages for a chat
    this.router.get(
      '/:chatId',
      this.authMiddleware.isLoggedIn,
      messageController.getChatMessages.bind(messageController)
    );

    // Send a new message
    this.router.post(
      '/',
      this.authMiddleware.isLoggedIn,
      validateSendMessage,
      messageController.sendMessage.bind(messageController)
    );

    // Delete a message
    this.router.delete(
      '/:messageId',
      this.authMiddleware.isLoggedIn,
      messageController.deleteMessage.bind(messageController)
    );

    // Get message details
    this.router.get(
      '/:messageId/detail',
      this.authMiddleware.isLoggedIn,
      messageController.getMessageDetails.bind(messageController)
    );
  }
}

export const messageRoutes = new MessageRoutes();
