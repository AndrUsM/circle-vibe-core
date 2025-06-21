import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import {
  Chat,
  ChatSocketCommand,
  CreateChatSocketParams,
  JoinChatSocketParams,
  RefreshChatsSocketParams,
  SendMessageSocketParams,
  UserChatStatus,
} from '@circle-vibe/shared';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guards';
import {
  AuthService,
  ChatService,
  MessageService,
  UserService,
} from 'src/modules';
import { SocketAuthParams } from 'src/guards/ws-auth-guard/params';
import { MessageStatus, MessageType } from '@prisma/client';
import { ParticipantService } from 'src/modules/participant/participant.service';

@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  userId?: number;
  #dataLimit = 20;

  constructor(
    private messageService: MessageService,
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService,
    private participantService: ParticipantService,
  ) {}

  @UseGuards(WsAuthGuard)
  handleDisconnect(client: any) {
    console.log('handleDisconnect');
    if (!this.userId) {
      return;
    }

    this.userService.changeUserChatStatus(this.userId, UserChatStatus.OFFLINE);
  }

  @UseGuards(WsAuthGuard)
  handleConnection(client: Socket, ...args: any[]) {
    const { userId } = this.#getAuthParams(client);
    this.userId = userId;

    if (userId) {
      this.userService.changeUserChatStatus(userId, UserChatStatus.ONLINE);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.RECEIVE_MESSAGES)
  async handleReceiveMessages(
    @MessageBody() data: RefreshChatsSocketParams,
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId } = data;

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: data?.cursor ?? 0,
    });

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageSocketParams,
  ) {
    const { chatId, message } = data;

    await this.messageService.create({
      chatId,
      ...message,
    });

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: 0,
    });

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.JOIN_CHAT)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: JoinChatSocketParams,
  ) {
    /**
     * TODO: On user join chat, create a new chat participant entity
     * - check existence,
     * - if exists, emit messages and chat partifipant entity
     */

    const { chatId, cursor } = params;

    const chatParticipant =
      await this.participantService.getOrCreateChatParticipant({
        chatId,
        userId: Number(this.userId),
      });

    const messagesForChat = await this.messageService.getMessagesByChat(
      chatId,
      {
        limit: this.#dataLimit,
        cursor: cursor ?? 0,
      },
    );

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messagesForChat);
    client.emit(ChatSocketCommand.JOIN_CHAT, {chatParticipant});
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.CREATE_CHAT)
  async handleCreateChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatInputDto: CreateChatSocketParams,
  ) {
    const chat = await this.chatService.create({
      ...chatInputDto,
      usersLimit: 100,
    });

    await this.participantService.getOrCreateChatParticipant({
      chatId: chat.id,
      userId: Number(this.userId),
    });

    client.emit(ChatSocketCommand.REFRESH_CHATS, chat);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REFRESH_CHATS)
  async handleRefreshChats(@ConnectedSocket() client: Socket) {
    const chats = await this.chatService.getAll({
      userId: this.userId,
      cursor: 0,
      limit: this.#dataLimit,
    });

    client.emit(ChatSocketCommand.REFRESH_CHATS, chats);
  }

  #getAuthParams(socket: Socket) {
    const { token, personalToken } = (socket.handshake.auth ??
      {}) as SocketAuthParams;
    const { userId } = this.authService.parseJWT(token, personalToken);

    return { userId: userId ?? undefined };
  }
}
