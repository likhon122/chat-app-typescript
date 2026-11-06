import { Types } from 'mongoose';

/**
 * Chat Document Interface
 */
export interface IChat {
  _id: Types.ObjectId;
  chatName: string;
  groupChat: boolean;
  creator: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Document Interface
 */
export interface IMessage {
  _id: Types.ObjectId;
  content: string;
  sender: Types.ObjectId;
  chat: Types.ObjectId;
  attachment?: {
    publicId: string;
    url: string;
  }[];
  replyTo?: Types.ObjectId | string | null;
  realTimeId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat Notification Document Interface
 */
export interface IChatNotification {
  _id: Types.ObjectId;
  chat: Types.ObjectId;
  user: Types.ObjectId;
  unreadCount: number;
  lastMessage: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Chat Input
 */
export interface ICreateChatInput {
  chatName: string;
  groupChat: boolean;
  creator: Types.ObjectId | string;
  members: (Types.ObjectId | string)[];
}

/**
 * Create Message Input
 */
export interface ICreateMessageInput {
  content: string;
  sender: Types.ObjectId | string;
  chat: Types.ObjectId | string;
  attachment?: {
    publicId: string;
    url: string;
  }[];
  replyTo?: Types.ObjectId | string | null;
  realTimeId: string;
}
