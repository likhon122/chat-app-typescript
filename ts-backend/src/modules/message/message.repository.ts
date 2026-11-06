import { Types } from 'mongoose';
import { MessageModel } from '../../core/database/models/message.model.js';
import { IMessage, ICreateMessageInput } from '../../shared/types/chat.types.js';

/**
 * Message Repository
 * Handles all database operations related to messages
 */
export class MessageRepository {
  /**
   * Find message by ID
   */
  async findById(id: Types.ObjectId | string): Promise<IMessage | null> {
    return await MessageModel.findById(id).populate('sender', 'name username avatar').lean();
  }

  /**
   * Find messages by chat ID
   */
  async findByChatId(
    chatId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 50
  ): Promise<IMessage[]> {
    const skip = (page - 1) * limit;

    return await MessageModel.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar')
      .lean();
  }

  /**
   * Create a new message
   */
  async create(messageData: ICreateMessageInput): Promise<IMessage> {
    const message = new MessageModel(messageData);
    return await message.save();
  }

  /**
   * Delete message by ID
   */
  async deleteById(id: Types.ObjectId | string): Promise<IMessage | null> {
    return await MessageModel.findByIdAndDelete(id).lean();
  }

  /**
   * Delete all messages in a chat
   */
  async deleteByChatId(chatId: Types.ObjectId | string): Promise<number> {
    const result = await MessageModel.deleteMany({ chat: chatId });
    return result.deletedCount || 0;
  }

  /**
   * Count messages in a chat
   */
  async countByChatId(chatId: Types.ObjectId | string): Promise<number> {
    return await MessageModel.countDocuments({ chat: chatId });
  }

  /**
   * Get last message in a chat
   */
  async getLastMessageInChat(chatId: Types.ObjectId | string): Promise<IMessage | null> {
    return await MessageModel.findOne({ chat: chatId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username avatar')
      .lean();
  }
}

export const messageRepository = new MessageRepository();
