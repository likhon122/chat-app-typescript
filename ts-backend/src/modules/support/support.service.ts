import { Types } from 'mongoose';
import { supportRepository } from './support.repository.js';

/**
 * Support Service
 * Contains business logic for support operations
 */
export class SupportService {
  /**
   * Get all support messages
   */
  async getAllSupportMessages(page: number = 1, limit: number = 20) {
    return await supportRepository.findAll(page, limit);
  }

  /**
   * Create a new support message
   */
  async createSupportMessage(name: string, email: string, message: string) {
    if (!name || !email || !message) {
      throw new Error('Please provide all the required fields');
    }

    return await supportRepository.create(name, email, message);
  }

  /**
   * Get support message by ID
   */
  async getSupportMessageById(id: Types.ObjectId | string) {
    return await supportRepository.findById(id);
  }

  /**
   * Delete support message
   */
  async deleteSupportMessage(id: Types.ObjectId | string) {
    return await supportRepository.deleteById(id);
  }
}

export const supportService = new SupportService();
