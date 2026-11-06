import { Types } from 'mongoose';

/**
 * User Document Interface
 */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  username: string;
  bio: string;
  email: string;
  password: string;
  avatar: {
    publicId?: string;
    url?: string;
  };
  friends: Types.ObjectId[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation input
 */
export interface ICreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: {
    publicId?: string;
    url?: string;
  };
}

/**
 * User update input
 */
export interface IUpdateUserInput {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: {
    publicId?: string;
    url?: string;
  };
}

/**
 * User query filters
 */
export interface IUserFilters {
  _id?: Types.ObjectId | string;
  email?: string;
  username?: string;
  isAdmin?: boolean;
}
