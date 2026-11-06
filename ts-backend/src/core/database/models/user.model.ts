import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../../../shared/types/user.types.js';

/**
 * User Schema Definition
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required to sign up!'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required to sign up!'],
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    bio: {
      type: String,
      default: 'Chat is everything!!👍',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required to sign up!'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required to sign up!'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    avatar: {
      publicId: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

/**
 * User Model
 */
export const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);
