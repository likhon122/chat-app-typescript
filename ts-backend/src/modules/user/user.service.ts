import bcryptjs from 'bcryptjs';
import { Types } from 'mongoose';
import { userRepository } from './user.repository.js';
import { IUser, ICreateUserInput, IUpdateUserInput } from '../../shared/types/user.types.js';
import { IUserPayload } from '../../shared/types/auth.types.js';

/**
 * User Service
 * Contains business logic for user operations
 */
export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: Types.ObjectId | string): Promise<IUser | null> {
    return await userRepository.findById(userId);
  }

  /**
   * Get user by ID without password
   */
  async getUserByIdSafe(userId: Types.ObjectId | string): Promise<Partial<IUser> | null> {
    const user = await userRepository.findByIdWithoutPassword(userId);
    if (user && user.avatar?.url) {
      return {
        ...user,
        avatar: user.avatar.url as any,
      };
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await userRepository.findByEmail(email);
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<IUser | null> {
    return await userRepository.findByUsername(username);
  }

  /**
   * Create a new user
   */
  async createUser(userData: ICreateUserInput): Promise<IUser> {
    // Hash password before saving
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userData.password, salt);

    const userToCreate: ICreateUserInput = {
      ...userData,
      password: hashedPassword,
    };

    return await userRepository.create(userToCreate);
  }

  /**
   * Update user
   */
  async updateUser(
    userId: Types.ObjectId | string,
    updateData: IUpdateUserInput
  ): Promise<IUser | null> {
    return await userRepository.updateById(userId, updateData);
  }

  /**
   * Update user password
   */
  async updateUserPassword(
    userId: Types.ObjectId | string,
    newPasswordRaw: string
  ): Promise<IUser | null> {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPasswordRaw, salt);

    // Update using repository
    return await userRepository.updateById(userId, { password: hashedPassword } as any);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: Types.ObjectId | string): Promise<IUser | null> {
    return await userRepository.deleteById(userId);
  }

  /**
   * Verify user password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcryptjs.compare(plainPassword, hashedPassword);
  }

  /**
   * Add friend
   */
  async addFriend(
    userId: Types.ObjectId | string,
    friendId: Types.ObjectId | string
  ): Promise<void> {
    await userRepository.addFriend(userId, friendId);
    await userRepository.addFriend(friendId, userId);
  }

  /**
   * Remove friend
   */
  async removeFriend(
    userId: Types.ObjectId | string,
    friendId: Types.ObjectId | string
  ): Promise<void> {
    await userRepository.removeFriend(userId, friendId);
    await userRepository.removeFriend(friendId, userId);
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string, excludeUserId?: Types.ObjectId | string): Promise<IUser[]> {
    return await userRepository.searchUsers(searchTerm, excludeUserId);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    return await userRepository.findAll();
  }

  /**
   * Prepare user payload for JWT
   */
  prepareUserPayload(user: IUser): IUserPayload {
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar?.url,
      isAdmin: user.isAdmin,
    };
  }

  /**
   * Format user response (remove password, format avatar)
   */
  formatUserResponse(user: IUser): Partial<IUser> {
    const userObj = { ...user };
    delete (userObj as any).password;

    if (userObj.avatar?.url) {
      (userObj as any).avatar = userObj.avatar.url;
    }

    return userObj;
  }
}

export const userService = new UserService();
