import { UserModel } from '../../core/database/models/user.model.js';
import { ChatModel } from '../../core/database/models/chat.model.js';
import { MessageModel } from '../../core/database/models/message.model.js';

/**
 * Admin Service
 * Contains business logic for admin operations
 */

/**
 * Authenticate admin
 */
export const authenticateAdmin = (
  email: string,
  password: string,
  adminEmail: string,
  adminPassword: string
): boolean => {
  return email === adminEmail && password === adminPassword;
};

/**
 * Get all users with statistics
 */
export const getAllUsersWithStats = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  const allUsers = await UserModel.find()
    .select('name avatar email friends')
    .limit(limit)
    .skip(skip)
    .lean();

  const usersWithStats = await Promise.all(
    allUsers.map(async (user) => {
      const groupChats = await ChatModel.countDocuments({
        groupChat: true,
        members: user._id,
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar?.url || '',
        friends: user.friends?.length || 0,
        groupChats: groupChats || 0,
      };
    })
  );

  return usersWithStats;
};

/**
 * Get all messages with pagination
 */
export const getAllMessages = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const messages = await MessageModel.find()
    .limit(limit)
    .skip(skip)
    .populate('sender', 'name avatar')
    .populate('chat', 'groupChat')
    .lean();

  const formattedMessages = messages.map((message) => {
    const sender = message.sender as any;
    return {
      _id: message._id,
      content: message.content,
      attachment: message.attachment || [],
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar?.url || '',
      },
      chatDetails: message.chat || {},
      createdAt: message.createdAt,
    };
  });

  return formattedMessages;
};

/**
 * Get all chats with details
 */
export const getAllChats = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const chats = await ChatModel.find()
    .limit(limit)
    .skip(skip)
    .populate('creator', 'name avatar')
    .populate('members', 'avatar')
    .lean();

  const chatDetails = chats.map((chat) => {
    const creator = chat.creator as any;
    const members = chat.members as any[];
    const membersPhotoUrl = members.slice(0, 3).map((member) => member.avatar?.url || '');

    return {
      _id: chat._id,
      chatName: chat.chatName,
      groupChat: chat.groupChat,
      creator: {
        _id: creator?._id || '',
        name: creator?.name || 'none',
        avatar: creator?.avatar?.url || '',
      },
      membersPhotoUrl,
    };
  });

  return chatDetails;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  // Get total counts
  const [totalUser, totalChat, totalGroupChat, totalMessage] = await Promise.all([
    UserModel.countDocuments(),
    ChatModel.countDocuments(),
    ChatModel.countDocuments({ groupChat: true }),
    MessageModel.countDocuments(),
  ]);

  const totalSingleChat = totalChat - totalGroupChat;

  // Get last 7 days messages
  const today = new Date();
  const last7DayDate = new Date();
  last7DayDate.setDate(today.getDate() - 7);

  const last7DaysMessages = await MessageModel.find({
    createdAt: {
      $gte: last7DayDate,
      $lte: today,
    },
  }).select('createdAt');

  // Count messages per day
  const last7DaysMessagesCount = new Array(7).fill(0);
  const dayInMilliseconds = 86400000;

  last7DaysMessages.forEach((message) => {
    const messageCurrentIndex = Math.floor(
      (today.getTime() - message.createdAt.getTime()) / dayInMilliseconds
    );
    if (messageCurrentIndex >= 0 && messageCurrentIndex < 7) {
      last7DaysMessagesCount[6 - messageCurrentIndex]++;
    }
  });

  return {
    totalUser,
    totalChat,
    totalGroupChat,
    totalSingleChat,
    totalMessage,
    last7DaysMessagesCount,
  };
};
