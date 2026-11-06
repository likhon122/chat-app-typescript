import { Types } from 'mongoose';
import { chatRepository } from './chat.repository.js';
import { IChat, ICreateChatInput } from '../../shared/types/chat.types.js';

/**
 * Chat Service
 * Contains business logic for chat operations
 */
export class ChatService {
  /**
   * Get all chats for a user
   */
  async getUserChats(userId: Types.ObjectId | string): Promise<IChat[]> {
    return await chatRepository.findUserChats(userId);
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: Types.ObjectId | string): Promise<IChat | null> {
    return await chatRepository.findById(chatId);
  }

  /**
   * Create a new chat (private or group)
   */
  async createChat(chatData: ICreateChatInput): Promise<IChat> {
    // If it's a private chat, check if it already exists
    if (!chatData.groupChat && chatData.members.length === 2) {
      const existingChat = await chatRepository.findPrivateChat(
        chatData.members[0],
        chatData.members[1]
      );

      if (existingChat) {
        return existingChat;
      }
    }

    return await chatRepository.create(chatData);
  }

  /**
   * Add member to group chat
   */
  async addMemberToChat(
    chatId: Types.ObjectId | string,
    memberId: Types.ObjectId | string,
    requesterId: Types.ObjectId | string
  ): Promise<IChat | null> {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.groupChat) {
      throw new Error('Cannot add members to private chat');
    }

    if (chat.creator.toString() !== requesterId.toString()) {
      throw new Error('Only the creator can add members');
    }

    return await chatRepository.addMember(chatId, memberId);
  }

  /**
   * Remove member from group chat
   */
  async removeMemberFromChat(
    chatId: Types.ObjectId | string,
    memberId: Types.ObjectId | string,
    requesterId: Types.ObjectId | string
  ): Promise<IChat | null> {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.groupChat) {
      throw new Error('Cannot remove members from private chat');
    }

    // Creator can remove anyone, or user can remove themselves
    if (
      chat.creator.toString() !== requesterId.toString() &&
      memberId.toString() !== requesterId.toString()
    ) {
      throw new Error('You do not have permission to remove this member');
    }

    return await chatRepository.removeMember(chatId, memberId);
  }

  /**
   * Leave chat (remove self)
   */
  async leaveChat(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IChat | null> {
    return await chatRepository.removeMember(chatId, userId);
  }

  /**
   * Delete chat
   */
  async deleteChat(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<IChat | null> {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.creator.toString() !== userId.toString()) {
      throw new Error('Only the creator can delete the chat');
    }

    return await chatRepository.deleteById(chatId);
  }

  /**
   * Update chat name
   */
  async updateChatName(
    chatId: Types.ObjectId | string,
    chatName: string,
    userId: Types.ObjectId | string
  ): Promise<IChat | null> {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (!chat.groupChat) {
      throw new Error('Cannot rename private chat');
    }

    if (chat.creator.toString() !== userId.toString()) {
      throw new Error('Only the creator can rename the chat');
    }

    return await chatRepository.updateChatName(chatId, chatName);
  }

  /**
   * Check if user is member of chat
   */
  async isUserMemberOfChat(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<boolean> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) return false;

    return chat.members.some((member) => member.toString() === userId.toString());
  }
}

export const chatService = new ChatService();
