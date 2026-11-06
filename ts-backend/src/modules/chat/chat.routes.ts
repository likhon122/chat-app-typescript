import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';
import {
  validateCreateChat,
  validateAddMember,
  validateUpdateChatName,
} from './chat.validation.js';

/**
 * Chat Routes
 * Defines all routes for chat operations
 */
export class ChatRoutes {
  public router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Get all chats for logged-in user
    this.router.get(
      '/',
      this.authMiddleware.isLoggedIn,
      chatController.getMyChats.bind(chatController)
    );

    // Get chat details by ID
    this.router.get(
      '/:id',
      this.authMiddleware.isLoggedIn,
      chatController.getChatDetails.bind(chatController)
    );

    // Create a new chat
    this.router.post(
      '/',
      this.authMiddleware.isLoggedIn,
      validateCreateChat,
      chatController.createChat.bind(chatController)
    );

    // Add member to group chat
    this.router.post(
      '/:id/member',
      this.authMiddleware.isLoggedIn,
      validateAddMember,
      chatController.addMember.bind(chatController)
    );

    // Remove member from group chat
    this.router.delete(
      '/:id/member/:memberId',
      this.authMiddleware.isLoggedIn,
      chatController.removeMember.bind(chatController)
    );

    // Leave chat
    this.router.post(
      '/:id/leave',
      this.authMiddleware.isLoggedIn,
      chatController.leaveChat.bind(chatController)
    );

    // Delete chat
    this.router.delete(
      '/:id',
      this.authMiddleware.isLoggedIn,
      chatController.deleteChat.bind(chatController)
    );

    // Update chat name
    this.router.put(
      '/:id/name',
      this.authMiddleware.isLoggedIn,
      validateUpdateChatName,
      chatController.updateChatName.bind(chatController)
    );
  }
}

export const chatRoutes = new ChatRoutes().router;
