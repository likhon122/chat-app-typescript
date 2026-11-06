import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Notification Subscription Interface
 */
export interface INotificationSubscription extends Document {
  user: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification Subscription Schema Definition
 */
const notificationSubscriptionSchema = new Schema<INotificationSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id is required!'],
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required!'],
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'p256dh key is required!'],
      },
      auth: {
        type: String,
        required: [true, 'Auth key is required!'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
notificationSubscriptionSchema.index({ user: 1 });

/**
 * Notification Subscription Model
 */
export const NotificationSubscriptionModel: Model<INotificationSubscription> =
  mongoose.model<INotificationSubscription>(
    'NotificationSubscription',
    notificationSubscriptionSchema
  );
