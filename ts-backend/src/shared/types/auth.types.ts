import { Request } from 'express';
import { Types } from 'mongoose';

/**
 * Extended Express Request with user information
 */
export interface IAuthenticatedRequest extends Request {
  userId?: Types.ObjectId | string;
  user?: IUserPayload;
}

/**
 * User payload for JWT tokens
 */
export interface IUserPayload {
  _id: Types.ObjectId | string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
}

/**
 * Socket user information
 */
export interface ISocketUser {
  _id: Types.ObjectId | string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}
