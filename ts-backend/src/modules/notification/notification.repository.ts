import { Types } from 'mongoose';
import { ChatNotificationModel } from '../../core/database/models/chat-notification.model.js';
import { NotificationSubscriptionModel } from '../../core/database/models/notification-subscription.model.js';
import { FriendRequestNotificationModel } from '../../core/database/models/sendFriendRequestNotification.model.js';

/**
 * Notification Repository
 * Handles all database operations related to notifications
 */
export class NotificationRepository {
  /**
   * Create or update notification subscription
   */
  async upsertSubscription(endpoint: string, keys: any, userId: Types.ObjectId | string) {
    const existingSubscription = await NotificationSubscriptionModel.findOne({ endpoint });

    if (existingSubscription) {
      existingSubscription.keys = keys;
      existingSubscription.userId = userId;
      await existingSubscription.save();
      return existingSubscription;
    }

    const subscription = new NotificationSubscriptionModel({
      endpoint,
      keys,
      userId,
    });
    return await subscription.save();
  }

  /**
   * Delete subscription by endpoint
   */
  async deleteSubscription(endpoint: string): Promise<number> {
    const result = await NotificationSubscriptionModel.deleteOne({ endpoint });
    return result.deletedCount || 0;
  }

  /**
   * Get chat notifications for user
   */
  async getChatNotificationsByUserId(userId: Types.ObjectId | string) {
    return await ChatNotificationModel.find({
      users: userId,
    }).select('chat countPerUser');
  }

  /**
   * Create or update chat notification
   */
  async upsertChatNotification(chatId: Types.ObjectId | string, userId: Types.ObjectId | string) {
    const chatNotification = await ChatNotificationModel.findOne({ chat: chatId });

    if (!chatNotification) {
      const newNotification = new ChatNotificationModel({
        chat: chatId,
        users: [userId],
        countPerUser: new Map([[userId.toString(), 1]]),
      });
      return await newNotification.save();
    }

    if (chatNotification.users.includes(userId)) {
      const currentCount = chatNotification.countPerUser.get(userId.toString()) || 0;
      chatNotification.countPerUser.set(userId.toString(), currentCount + 1);
    } else {
      chatNotification.users.push(userId);
      chatNotification.countPerUser.set(userId.toString(), 1);
    }

    return await chatNotification.save();
  }

  /**
   * Mark chat notification as read
   */
  async markChatNotificationAsRead(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    const chatNotification = await ChatNotificationModel.findOne({ chat: chatId });

    if (!chatNotification) {
      throw new Error('Chat notification not found');
    }

    if (chatNotification.users.includes(userId)) {
      chatNotification.countPerUser.set(userId.toString(), 0);
    }

    return await chatNotification.save();
  }

  /**
   * Delete user from chat notification
   */
  async deleteUserFromChatNotification(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    const chatNotification = await ChatNotificationModel.findOne({ chat: chatId });

    if (!chatNotification) {
      throw new Error('Chat notification not found');
    }

    chatNotification.users = chatNotification.users.filter(
      (user) => user.toString() !== userId.toString()
    );
    chatNotification.countPerUser.delete(userId.toString());

    return await chatNotification.save();
  }

  /**
   * Delete chat notification
   */
  async deleteChatNotification(chatId: Types.ObjectId | string) {
    const result = await ChatNotificationModel.findOneAndDelete({ chat: chatId });
    return result;
  }

  /**
   * Create or update friend request notification
   */
  async upsertFriendRequestNotification(userId: Types.ObjectId | string) {
    const notification = await FriendRequestNotificationModel.findOne({ userId });

    if (!notification) {
      const newNotification = new FriendRequestNotificationModel({
        userId,
        count: 1,
      });
      return await newNotification.save();
    }

    notification.count += 1;
    return await notification.save();
  }

  /**
   * Get friend request notification count
   */
  async getFriendRequestNotification(userId: Types.ObjectId | string) {
    return await FriendRequestNotificationModel.findOne({ userId });
  }

  /**
   * Mark friend request notification as read
   */
  async markFriendRequestAsRead(userId: Types.ObjectId | string) {
    const notification = await FriendRequestNotificationModel.findOne({ userId });

    if (!notification) {
      throw new Error('Friend request notification not found');
    }

    notification.count = 0;
    return await notification.save();
  }
}

export const notificationRepository = new NotificationRepository();
