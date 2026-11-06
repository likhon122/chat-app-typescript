import { Types } from 'mongoose';
import { Socket } from 'socket.io';
import { ISocketUser } from './auth.types.js';

/**
 * Extended Socket with user information
 */
export interface IAuthenticatedSocket extends Socket {
  user?: ISocketUser;
  request?: any;
}

/**
 * Socket Event Data Types
 */
export interface INewMessageData {
  chatId: string;
  members: string[];
  message: string;
  replyTo?: string | null;
}

export interface ITypingData {
  members: string[];
  chatId: string;
}

export interface ICallUserData {
  to: string[];
  offer: any; // RTCSessionDescriptionInit
  callType: 'audio' | 'video';
  chatId: string;
  callerInfo: {
    name: string;
    avatar?: string;
  };
}

export interface IAnswerCallData {
  to: string[];
  answer: any; // RTCSessionDescriptionInit
  chatId: string;
}

export interface IIceCandidateData {
  to: string[];
  candidate: any; // RTCIceCandidate
}

export interface IRejectCallData {
  to: string[];
}

/**
 * Real-time message structure
 */
export interface IRealTimeMessage {
  content: string;
  replyTo: {
    _id: Types.ObjectId;
    realTimeId: string;
    content: string;
    attachment?: {
      publicId: string;
      url: string;
    }[];
    sender: {
      _id: Types.ObjectId;
      name: string;
      avatar?: string;
    };
    createdAt: Date;
  } | null;
  realTimeId: string;
  sender: {
    _id: Types.ObjectId | string;
    name: string;
    avatar?: string;
  };
  chatId: string;
  createdAt: string;
}
