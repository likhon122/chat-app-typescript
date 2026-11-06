import mongoose, { Schema, Model } from 'mongoose';
import { IMessage } from '../../../shared/types/chat.types.js';

/**
 * Message Schema Definition
 */
const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, 'Message content is required!'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender id is required!'],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat id is required!'],
    },
    attachment: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    replyTo: {
      type: Schema.Types.Mixed,
      default: null,
    },
    realTimeId: {
      type: String,
      required: [true, 'Real-time ID is required!'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ realTimeId: 1 }, { unique: true });
messageSchema.index({ sender: 1 });

/**
 * Message Model
 */
export const MessageModel: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
