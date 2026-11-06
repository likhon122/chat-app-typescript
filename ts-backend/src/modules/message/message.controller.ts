import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../../shared/types/auth.types.js';
import { messageService } from './message.service.js';
import { ResponseHandler } from '../../utils/response-handler.util.js';
import { HTTP_STATUS } from '../../shared/constants/app-constants.js';

/**
 * Message Controller
 * Handles HTTP requests for message operations
 */
export class MessageController {
  /**
   * Get messages for a chat
   * @route GET /api/v1/message/:chatId
   */
  async getChatMessages(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { chatId } = req.params as { chatId: string };
      const userId = req.userId;
      const { page = '1', limit = '50' } = req.query as { page?: string; limit?: string };

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const messages = await messageService.getChatMessages(
        chatId,
        userId,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Messages retrieved successfully!',
        payload: { messages },
      });
    } catch (error: any) {
      if (error.message === 'You are not a member of this chat') {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          errorMessage: error.message,
        });
      }
      return next(error);
    }
  }

  /**
   * Send a new message
   * @route POST /api/v1/message
   */
  async sendMessage(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { content, chat, attachments } = req.body as {
        content: string;
        chat: string;
        attachments?: string[];
      };

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const message = await messageService.sendMessage(
        {
          content,
          chat,
          sender: userId,
          attachments: attachments || [],
        },
        userId
      );

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.CREATED,
        successMessage: 'Message sent successfully!',
        payload: { message },
      });
    } catch (error: any) {
      if (error.message === 'You are not a member of this chat') {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          errorMessage: error.message,
        });
      }
      return next(error);
    }
  }

  /**
   * Delete a message
   * @route DELETE /api/v1/message/:messageId
   */
  async deleteMessage(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params as { messageId: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      await messageService.deleteMessage(messageId, userId);

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Message deleted successfully!',
        payload: {},
      });
    } catch (error: any) {
      return ResponseHandler.error(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessage: error.message || 'Failed to delete message',
      });
    }
  }

  /**
   * Get message details
   * @route GET /api/v1/message/:messageId/detail
   */
  async getMessageDetails(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params as { messageId: string };
      const userId = req.userId;

      if (!userId) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          errorMessage: 'Unauthorized',
        });
      }

      const message = await messageService.getMessageById(messageId, userId);

      if (!message) {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.NOT_FOUND,
          errorMessage: 'Message not found',
        });
      }

      return ResponseHandler.success(res, {
        statusCode: HTTP_STATUS.OK,
        successMessage: 'Message details retrieved successfully!',
        payload: { message },
      });
    } catch (error: any) {
      if (error.message === 'You are not a member of this chat') {
        return ResponseHandler.error(res, {
          statusCode: HTTP_STATUS.FORBIDDEN,
          errorMessage: error.message,
        });
      }
      return next(error);
    }
  }
}

export const messageController = new MessageController();
