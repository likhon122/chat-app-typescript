import { Types } from 'mongoose';
import { SupportModel } from '../../core/database/models/support.model.js';

/**
 * Support Repository
 * Handles all database operations related to support
 */
export class SupportRepository {
  /**
   * Get all support messages with pagination
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await SupportModel.find().limit(limit).skip(skip).lean();
  }

  /**
   * Create a new support message
   */
  async create(name: string, email: string, message: string) {
    const supportMessage = new SupportModel({
      name,
      email,
      message,
    });
    return await supportMessage.save();
  }

  /**
   * Find support message by ID
   */
  async findById(id: Types.ObjectId | string) {
    return await SupportModel.findById(id).lean();
  }

  /**
   * Delete support message
   */
  async deleteById(id: Types.ObjectId | string) {
    return await SupportModel.findByIdAndDelete(id);
  }
}

export const supportRepository = new SupportRepository();
