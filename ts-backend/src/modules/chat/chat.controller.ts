import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../../shared/types/auth.types.js';
import { chatService } from './chat.service.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';

/**
 * Chat Controller
 * Handles HTTP requests for chat operations
 */
export class ChatController {
  /**
   * Get all chats for logged-in user
   * @route GET /api/v1/chat
   */
  async getMyChats(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const chats = await chatService.getUserChats(userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Chats retrieved successfully!',
        payload: { chats },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get chat details by ID
   * @route GET /api/v1/chat/:id
   */
  async getChatDetails(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const chat = await chatService.getChatById(id);

      if (!chat) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'Chat not found',
        });
      }

      // Check if user is member of chat
      const isMember = await chatService.isUserMemberOfChat(id, userId);
      if (!isMember) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          errorMessage: 'You are not a member of this chat',
        });
      }

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Chat details retrieved successfully!',
        payload: { chat },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Create a new chat
   * @route POST /api/v1/chat
   */
  async createChat(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { chatName, groupChat, members } = req.body as {
        chatName: string;
        groupChat: boolean;
        members: string[];
      };

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      // Ensure creator is in members list
      const allMembers = [...new Set([userId, ...members])];

      const chat = await chatService.createChat({
        chatName,
        groupChat,
        creator: userId,
        members: allMembers,
      });

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.CREATED,
        successMessage: 'Chat created successfully!',
        payload: { chat },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Add member to group chat
   * @route POST /api/v1/chat/:id/member
   */
  async addMember(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { memberId } = req.body as { memberId: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const chat = await chatService.addMemberToChat(id, memberId, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Member added successfully!',
        payload: { chat },
      });
    } catch (error: any) {
      return ResponseHandler.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessage: error.message || 'Failed to add member',
      });
    }
  }

  /**
   * Remove member from group chat
   * @route DELETE /api/v1/chat/:id/member/:memberId
   */
  async removeMember(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params as { id: string; memberId: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const chat = await chatService.removeMemberFromChat(id, memberId, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Member removed successfully!',
        payload: { chat },
      });
    } catch (error: any) {
      return ResponseHandler.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessage: error.message || 'Failed to remove member',
      });
    }
  }

  /**
   * Leave chat
   * @route POST /api/v1/chat/:id/leave
   */
  async leaveChat(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      await chatService.leaveChat(id, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'You have left the chat',
        payload: {},
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete chat
   * @route DELETE /api/v1/chat/:id
   */
  async deleteChat(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      await chatService.deleteChat(id, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Chat deleted successfully!',
        payload: {},
      });
    } catch (error: any) {
      return ResponseHandler.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessage: error.message || 'Failed to delete chat',
      });
    }
  }

  /**
   * Update chat name
   * @route PUT /api/v1/chat/:id/name
   */
  async updateChatName(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { chatName } = req.body as { chatName: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const chat = await chatService.updateChatName(id, chatName, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Chat name updated successfully!',
        payload: { chat },
      });
    } catch (error: any) {
      return ResponseHandler.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessage: error.message || 'Failed to update chat name',
      });
    }
  }
}

export const chatController = new ChatController();
