import mongoose, { Schema, Model } from 'mongoose';
import { IChat } from '../../../shared/types/chat.types.js';

/**
 * Chat Schema Definition
 */
const chatSchema = new Schema<IChat>(
  {
    chatName: {
      type: String,
      required: [true, 'Chat name is required!'],
      trim: true,
    },
    groupChat: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator id is required!'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Member id is required!'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
chatSchema.index({ creator: 1 });
chatSchema.index({ members: 1 });

/**
 * Chat Model
 */
export const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
