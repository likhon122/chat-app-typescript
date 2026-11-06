import mongoose, { Schema, Model } from 'mongoose';
import { IChatNotification } from '../../../shared/types/chat.types.js';

/**
 * Chat Notification Schema Definition
 */
const chatNotificationSchema = new Schema<IChatNotification>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat id is required!'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id is required!'],
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
chatNotificationSchema.index({ user: 1, chat: 1 });

/**
 * Chat Notification Model
 */
export const ChatNotificationModel: Model<IChatNotification> = mongoose.model<IChatNotification>(
  'ChatNotification',
  chatNotificationSchema
);
