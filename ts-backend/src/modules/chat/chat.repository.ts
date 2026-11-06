import { Types } from 'mongoose';
import { ChatModel } from '../../core/database/models/chat.model.js';
import { IChat, ICreateChatInput } from '../../shared/types/chat.types.js';

/**
 * Chat Repository
 * Handles all database operations related to chats
 */
export class ChatRepository {
  /**
   * Find chat by ID
   */
  async findById(id: Types.ObjectId | string): Promise<IChat | null> {
    return await ChatModel.findById(id).populate('members', 'name avatar').lean();
  }

  /**
   * Find user chats
   */
  async findUserChats(userId: Types.ObjectId | string): Promise<IChat[]> {
    return await ChatModel.find({
      members: userId,
    })
      .populate('members', 'name username avatar')
      .populate('creator', 'name username avatar')
      .sort({ updatedAt: -1 })
      .lean();
  }

  /**
   * Create a new chat
   */
  async create(chatData: ICreateChatInput): Promise<IChat> {
    const chat = new ChatModel(chatData);
    return await chat.save();
  }

  /**
   * Add member to chat
   */
  async addMember(
    chatId: Types.ObjectId | string,
    memberId: Types.ObjectId | string
  ): Promise<IChat | null> {
    return await ChatModel.findByIdAndUpdate(
      chatId,
      { $addToSet: { members: memberId } },
      { new: true }
    )
      .populate('members', 'name username avatar')
      .lean();
  }

  /**
   * Remove member from chat
   */
  async removeMember(
    chatId: Types.ObjectId | string,
    memberId: Types.ObjectId | string
  ): Promise<IChat | null> {
    return await ChatModel.findByIdAndUpdate(
      chatId,
      { $pull: { members: memberId } },
      { new: true }
    )
      .populate('members', 'name username avatar')
      .lean();
  }

  /**
   * Delete chat by ID
   */
  async deleteById(id: Types.ObjectId | string): Promise<IChat | null> {
    return await ChatModel.findByIdAndDelete(id).lean();
  }

  /**
   * Find chat between two users
   */
  async findPrivateChat(
    user1: Types.ObjectId | string,
    user2: Types.ObjectId | string
  ): Promise<IChat | null> {
    return await ChatModel.findOne({
      groupChat: false,
      members: { $all: [user1, user2], $size: 2 },
    }).lean();
  }

  /**
   * Update chat name
   */
  async updateChatName(chatId: Types.ObjectId | string, chatName: string): Promise<IChat | null> {
    return await ChatModel.findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate('members', 'name username avatar')
      .lean();
  }
}

export const chatRepository = new ChatRepository();
