import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Support Ticket Interface
 */
export interface ISupportTicket extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Support Ticket Schema Definition
 */
const supportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id is required!'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required!'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required!'],
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });

/**
 * Support Ticket Model
 */
export const SupportTicketModel: Model<ISupportTicket> = mongoose.model<ISupportTicket>(
  'Support',
  supportTicketSchema
);
