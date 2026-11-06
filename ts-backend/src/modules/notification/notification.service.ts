import { Types } from 'mongoose';
import { notificationRepository } from './notification.repository.js';

/**
 * Notification Service
 * Contains business logic for notification operations
 */
export class NotificationService {
  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(endpoint: string, keys: any, userId: Types.ObjectId | string) {
    return await notificationRepository.upsertSubscription(endpoint, keys, userId);
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(endpoint: string): Promise<boolean> {
    const deletedCount = await notificationRepository.deleteSubscription(endpoint);
    return deletedCount > 0;
  }

  /**
   * Get chat notifications for user
   */
  async getChatNotifications(userId: Types.ObjectId | string) {
    const notifications = await notificationRepository.getChatNotificationsByUserId(userId);

    const chatNotifications: any[] = [];
    notifications.forEach((notification) => {
      const count = notification.countPerUser.get(userId.toString());
      if (count) {
        chatNotifications.push({
          chatId: notification.chat,
          userId,
          count,
        });
      }
    });

    return chatNotifications;
  }

  /**
   * Create chat notification
   */
  async createChatNotification(chatId: Types.ObjectId | string, userId: Types.ObjectId | string) {
    return await notificationRepository.upsertChatNotification(chatId, userId);
  }

  /**
   * Mark chat notification as read
   */
  async readChatNotification(chatId: Types.ObjectId | string, userId: Types.ObjectId | string) {
    return await notificationRepository.markChatNotificationAsRead(chatId, userId);
  }

  /**
   * Delete user from chat notification
   */
  async removeUserFromChatNotification(
    chatId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    return await notificationRepository.deleteUserFromChatNotification(chatId, userId);
  }

  /**
   * Delete chat notification
   */
  async deleteChatNotification(chatId: Types.ObjectId | string) {
    return await notificationRepository.deleteChatNotification(chatId);
  }

  /**
   * Create friend request notification
   */
  async createFriendRequestNotification(userId: Types.ObjectId | string) {
    return await notificationRepository.upsertFriendRequestNotification(userId);
  }

  /**
   * Get friend request notification count
   */
  async getFriendRequestNotificationCount(userId: Types.ObjectId | string) {
    return await notificationRepository.getFriendRequestNotification(userId);
  }

  /**
   * Mark friend request notification as read
   */
  async readFriendRequestNotification(userId: Types.ObjectId | string) {
    return await notificationRepository.markFriendRequestAsRead(userId);
  }
}

export const notificationService = new NotificationService();
