import { Types } from 'mongoose';
import { messageRepository } from './message.repository.js';
import { chatService } from '../chat/chat.service.js';
import { IMessage, ICreateMessageInput } from '../../shared/types/chat.types.js';

/**
 * Message Service
 * Contains business logic for message operations
 */
export class MessageService {
  /**
   * Get messages for a chat
   */
  async getChatMessages(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 50
  ): Promise<IMessage[]> {
    // Verify user is member of chat
    const isMember = await chatService.isUserMemberOfChat(chatId, userId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    return await messageRepository.findByChatId(chatId, page, limit);
  }

  /**
   * Send a new message
   */
  async sendMessage(
    messageData: ICreateMessageInput,
    senderId: Types.ObjectId | string
  ): Promise<IMessage> {
    // Verify sender is member of chat
    const isMember = await chatService.isUserMemberOfChat(messageData.chat, senderId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    // Ensure sender matches authenticated user
    if (messageData.sender.toString() !== senderId.toString()) {
      throw new Error('Cannot send message as another user');
    }

    return await messageRepository.create(messageData);
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IMessage | null> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      throw new Error('You can only delete your own messages');
    }

    return await messageRepository.deleteById(messageId);
  }

  /**
   * Get message by ID
   */
  async getMessageById(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IMessage | null> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      return null;
    }

    // Verify user is member of the chat
    const isMember = await chatService.isUserMemberOfChat(message.chat, userId);
    if (!isMember) {
      throw new Error('You are not a member of this chat');
    }

    return message;
  }

  /**
   * Delete all messages in a chat (admin/creator only)
   */
  async deleteAllMessagesInChat(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<number> {
    const chat = await chatService.getChatById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.creator.toString() !== userId.toString()) {
      throw new Error('Only the chat creator can delete all messages');
    }

    return await messageRepository.deleteByChatId(chatId);
  }
}

export const messageService = new MessageService();
