import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { MessageModel } from '../database/models/message.model.js';
import { IAuthenticatedSocket } from '../../shared/types/socket.types.js';
import { SOCKET_EVENTS } from '../../shared/constants/socket-events.js';
import {
  INewMessageData,
  ITypingData,
  ICallUserData,
  IAnswerCallData,
  IIceCandidateData,
  IRejectCallData,
  IRealTimeMessage,
} from '../../shared/types/socket.types.js';

/**
 * Socket Manager
 * Manages WebSocket connections and events
 */
export class SocketManager {
  private userSocketIds: Map<string, string>;
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.userSocketIds = new Map();
  }

  /**
   * Get socket IDs for members
   */
  private getSockets(members: string[] = []): string[] {
    if (!members || members.length === 0) return [];

    const sockets = members
      .map((member) => this.userSocketIds.get(member.toString()))
      .filter((socketId): socketId is string => socketId !== undefined);

    return sockets;
  }

  /**
   * Emit event to specific users
   */
  public emitEvent(event: string, users: string[], data: unknown = ''): void {
    const membersSocket = this.getSockets(users);
    this.io.to(membersSocket).emit(event, data);
  }

  /**
   * Handle new message
   */
  private async handleNewMessage(
    socket: IAuthenticatedSocket,
    data: INewMessageData
  ): Promise<void> {
    const { chatId, members, message, replyTo = null } = data;
    const user = socket.user!;

    let replyToMessageDetails = null;

    if (replyTo) {
      try {
        const originalMessage = await MessageModel.findOne({ realTimeId: replyTo }).populate(
          'sender',
          'name avatar'
        );

        if (originalMessage) {
          replyToMessageDetails = {
            _id: originalMessage._id,
            realTimeId: originalMessage.realTimeId,
            content: originalMessage.content,
            attachment: originalMessage.attachment,
            sender: {
              _id: (originalMessage.sender as any)._id,
              name: (originalMessage.sender as any).name,
              avatar: (originalMessage.sender as any).avatar?.url,
            },
            createdAt: originalMessage.createdAt,
          };
        }
      } catch (error) {
        console.log('Message with this realTimeId not found');
      }
    }

    const messageForRealTime: IRealTimeMessage = {
      content: message,
      replyTo: replyToMessageDetails,
      realTimeId: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
      chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDb = {
      content: message,
      sender: user._id,
      chat: chatId,
      replyTo: replyTo || null,
      realTimeId: messageForRealTime.realTimeId,
    };

    const membersSocket = this.getSockets(members);

    // Emit real-time message
    this.io.to(membersSocket).emit(SOCKET_EVENTS.NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    this.io.to(membersSocket).emit(SOCKET_EVENTS.NEW_MESSAGE_ALERT, {
      chatId,
      sender: user._id,
    });

    this.io.to(membersSocket).emit(SOCKET_EVENTS.REFETCH_CHATS, { chatId });

    try {
      const resMessage = await MessageModel.create(messageForDb);
      if (!resMessage) {
        console.error('Message not saved in DB!');
      }
    } catch (error) {
      console.error('Message not saved in DB:', error);
    }
  }

  /**
   * Handle typing events
   */
  private handleTyping(_socket: IAuthenticatedSocket, data: ITypingData, isTyping: boolean): void {
    const { members, chatId } = data;
    const membersSocket = this.getSockets(members);
    const event = isTyping ? SOCKET_EVENTS.START_TYPING : SOCKET_EVENTS.STOP_TYPING;
    this.io.to(membersSocket).emit(event, { chatId });
  }

  /**
   * Handle call user
   */
  private handleCallUser(socket: IAuthenticatedSocket, data: ICallUserData): void {
    const { to, offer, callType, chatId, callerInfo } = data;
    const user = socket.user!;
    const memberIds = to.filter((id) => id !== user._id.toString());
    const userSocketId = this.userSocketIds.get(user._id.toString());
    const targetSocketIds = this.getSockets(memberIds);

    if (targetSocketIds.length === 0) {
      if (userSocketId) {
        this.io.to(userSocketId).emit(SOCKET_EVENTS.USER_OFFLINE, to);
      }
      return;
    }

    this.io.to(targetSocketIds).emit(SOCKET_EVENTS.INCOMING_CALL, {
      from: user._id,
      offer,
      callType,
      fromName: user.name,
      chatId,
      members: to,
      callerInfo,
    });
  }

  /**
   * Handle answer call
   */
  private handleAnswerCall(socket: IAuthenticatedSocket, data: IAnswerCallData): void {
    const { to, answer, chatId } = data;
    const user = socket.user!;
    const memberIds = to.filter((id) => id !== user._id.toString());
    const targetSocketId = this.getSockets(memberIds);

    if (targetSocketId.length > 0) {
      this.io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_ANSWERED, { answer, chatId });
    } else {
      console.warn(`User ${memberIds.join(', ')} is not connected.`);
    }
  }

  /**
   * Handle ICE candidate
   */
  private handleIceCandidate(_socket: IAuthenticatedSocket, data: IIceCandidateData): void {
    const { to, candidate } = data;
    const targetSocketId = this.getSockets(to);

    if (targetSocketId.length > 0 && candidate) {
      this.io.to(targetSocketId).emit(SOCKET_EVENTS.ICE_CANDIDATE, { candidate });
    } else {
      console.warn(
        `ICE candidate not sent. User ${to.join(', ')} not connected or invalid candidate.`
      );
    }
  }

  /**
   * Handle reject call
   */
  private handleRejectCall(_socket: IAuthenticatedSocket, data: IRejectCallData): void {
    const { to } = data;
    const targetSocketId = this.getSockets(to);

    if (targetSocketId.length > 0) {
      this.io.to(targetSocketId).emit(SOCKET_EVENTS.CALL_REJECTED);
    } else {
      console.warn(`User ${to.join(', ')} is not connected. Call rejection failed.`);
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: IAuthenticatedSocket): void {
    if (socket.user) {
      this.userSocketIds.delete(socket.user._id.toString());
      console.log(`User disconnected: ${socket.user.name}`);
    }
  }

  /**
   * Initialize socket event handlers
   */
  public handleSocketEvents(): void {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
      const authenticatedSocket = socket as IAuthenticatedSocket;
      const { user } = authenticatedSocket;

      if (!user) {
        return;
      }

      this.userSocketIds.set(user._id.toString(), socket.id);
      console.log(`User connected: ${user.name} (${socket.id})`);

      // Message events
      socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data: INewMessageData) =>
        this.handleNewMessage(authenticatedSocket, data)
      );

      // Typing events
      socket.on(SOCKET_EVENTS.START_TYPING, (data: ITypingData) =>
        this.handleTyping(authenticatedSocket, data, true)
      );

      socket.on(SOCKET_EVENTS.STOP_TYPING, (data: ITypingData) =>
        this.handleTyping(authenticatedSocket, data, false)
      );

      // Call events
      socket.on(SOCKET_EVENTS.CALL_USER, (data: ICallUserData) =>
        this.handleCallUser(authenticatedSocket, data)
      );

      socket.on(SOCKET_EVENTS.ANSWER_CALL, (data: IAnswerCallData) =>
        this.handleAnswerCall(authenticatedSocket, data)
      );

      socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data: IIceCandidateData) =>
        this.handleIceCandidate(authenticatedSocket, data)
      );

      socket.on(SOCKET_EVENTS.REJECT_CALL, (data: IRejectCallData) =>
        this.handleRejectCall(authenticatedSocket, data)
      );

      // Disconnect event
      socket.on(SOCKET_EVENTS.DISCONNECT, () => this.handleDisconnect(authenticatedSocket));
    });
  }

  /**
   * Get user socket IDs map
   */
  public getUserSocketIds(): Map<string, string> {
    return this.userSocketIds;
  }
}
