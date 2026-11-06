import { Types } from 'mongoose';
import { UserModel } from '../../core/database/models/user.model.js';
import { IUser, ICreateUserInput, IUserFilters } from '../../shared/types/user.types.js';

/**
 * User Repository
 * Handles all database operations related to users
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: Types.ObjectId | string): Promise<IUser | null> {
    return await UserModel.findById(id).lean();
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).lean();
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username }).lean();
  }

  /**
   * Find user with custom filters
   */
  async findOne(filters: IUserFilters): Promise<IUser | null> {
    return await UserModel.findOne(filters).lean();
  }

  /**
   * Find user by ID without password
   */
  async findByIdWithoutPassword(id: Types.ObjectId | string): Promise<Partial<IUser> | null> {
    return await UserModel.findById(id).select('-password').lean();
  }

  /**
   * Create a new user
   */
  async create(userData: ICreateUserInput): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  /**
   * Update user by ID
   */
  async updateById(id: Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  /**
   * Delete user by ID
   */
  async deleteById(id: Types.ObjectId | string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id).lean();
  }

  /**
   * Find all users with filters
   */
  async findAll(filters: IUserFilters = {}): Promise<IUser[]> {
    return await UserModel.find(filters).select('-password').lean();
  }

  /**
   * Add friend to user's friend list
   */
  async addFriend(
    userId: Types.ObjectId | string,
    friendId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } },
      { new: true }
    ).lean();
  }

  /**
   * Remove friend from user's friend list
   */
  async removeFriend(
    userId: Types.ObjectId | string,
    friendId: Types.ObjectId | string
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true }
    ).lean();
  }

  /**
   * Search users by name or username
   */
  async searchUsers(searchTerm: string, excludeUserId?: Types.ObjectId | string): Promise<IUser[]> {
    const query: Record<string, unknown> = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    return await UserModel.find(query).select('-password').lean();
  }
}

export const userRepository = new UserRepository();
