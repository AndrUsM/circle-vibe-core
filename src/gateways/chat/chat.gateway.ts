import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { io } from 'socket.io-client';

import {
  ChatSocketCommand,
  CreateChatSocketParams,
  JoinChatSocketParams,
  RefreshChatsSocketParams,
  SendMessageSocketParams,
  UserChatStatus,
  FileVideoServerSocketKeys,
  GatewayNamespaces,
  SendFileMessageMetaInput,
  MessageType,
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
import { ParticipantService } from 'src/modules/participant/participant.service';
import { MessageFileVideoCreateDto } from 'src/modules/message/dtos';

export interface SendFileMessageChatSocketParams {
  content: string;
  chatId: number;
  senderId: number;
  threadId?: number;
  hidden: boolean;
  messageType: MessageType;
  fileUrl: string;
  optimizedUrl: string;
  fileMeta: SendFileMessageMetaInput;
}

@WebSocketGateway(3002, {
  cors: true,
  namespace: `/${GatewayNamespaces.CHAT_MAIN}`,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // move to DB
  userIds = new Map<string, number>();
  #dataLimit = 50;

  #fileVideoServerSocketUrl = `http://localhost:3005/api/${GatewayNamespaces.VIDEO_UPLOAD}`;
  fileVideoServerSocket = io(this.#fileVideoServerSocketUrl);

  constructor(
    private messageService: MessageService,
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService,
    private participantService: ParticipantService,
  ) {}

  @UseGuards(WsAuthGuard)
  handleDisconnect(client: Socket) {
    const userId = this.userIds.get(client.id);

    if (!userId) {
      return;
    }

    this.userService.changeUserChatStatus(userId, UserChatStatus.OFFLINE);
  }

  @UseGuards(WsAuthGuard)
  handleConnection(client: Socket, ...args: any[]) {
    const { userId } = this.#getAuthParams(client);
    const userIdsValues = Array.from(this.userIds.entries());

    const isUserExists = userIdsValues.find(
      ([_, value]) => value === Number(userId),
    );

    if (!isUserExists) {
      this.userIds.set(client.id, Number(userId));
    } else {
      const clientId = isUserExists[0];

      this.userIds.delete(clientId);
      this.userIds.set(client.id, Number(userId));
    }

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
    const roomName = String(chatId);

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: data?.cursor ?? 0,
    });

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.SEND_VIDEO_FILE_MESSAGE)
  async handleSendVideoFile(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageFileVideoCreateDto,
  ) {
    const chatId = data.chatId;
    const roomName = String(chatId);

    await this.messageService.createFileVideoMessage(data);

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: 0,
    });

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);
    await this.#notifyUserAboutNewMessage(client, chatId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageSocketParams,
  ) {
    const chatId = data.chatId;
    const roomName = String(chatId);
    const message = data;

    await this.messageService.create({
      ...message,
      files: [],
    });

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: 0,
    });

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);

    await this.#notifyUserAboutNewMessage(client, chatId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.SEND_FILE_MESSAGE)
  async handleSendFile(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: SendFileMessageChatSocketParams,
  ) {
    const { chatId } = params;
    const roomName = String(chatId);

    await this.messageService.createFileMessage(params);

    const messages = await this.messageService.getMessagesByChat(chatId, {
      limit: this.#dataLimit,
      cursor: 0,
    });

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);

    await this.#notifyUserAboutNewMessage(client, chatId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.JOIN_CHAT)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: JoinChatSocketParams,
  ) {
    const { chatId, cursor } = params;
    const userId = this.userIds.get(client.id);
    const roomName = String(chatId);

    if (!userId) {
      return;
    }

    const chatParticipant = await this.participantService.getChatParticipants({
      chatId,
      userId,
    });

    const messagesForChat = await this.messageService.getMessagesByChat(
      chatId,
      {
        limit: this.#dataLimit,
        cursor: cursor ?? 0,
      },
    );

    client.join(roomName);

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messagesForChat);
    client.emit(ChatSocketCommand.JOIN_CHAT, { chatParticipant });
    client.emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.CREATE_CHAT)
  async handleCreateChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatInputDto: CreateChatSocketParams,
  ) {
    const userId = this.userIds.get(client.id);

    if (!userId) {
      return;
    }

    const chat = await this.chatService.create({
      ...chatInputDto,
      usersLimit: 100,
    });

    await this.participantService.getOrCreateChatParticipant({
      chatId: chat.id,
      userId,
    });

    const chats = await this.chatService.getAll({
      userId,
      cursor: 0,
      limit: this.#dataLimit,
    });

    client.emit(ChatSocketCommand.REFRESH_CHATS, chats);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REFRESH_CHATS)
  async handleRefreshChats(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName?: string,
  ) {
    const userId = this.userIds.get(client.id);

    if (!userId) {
      return;
    }

    const chats = await this.chatService.getAll({
      userId,
      cursor: 0,
      limit: this.#dataLimit,
    });

    if (roomName) {
      this.server.to(roomName).emit(ChatSocketCommand.REFRESH_CHATS, chats);

      return;
    }

    client.emit(ChatSocketCommand.REFRESH_CHATS, chats);
  }

  #getAuthParams(socket: Socket) {
    const { token, personalToken } = (socket.handshake.auth ??
      {}) as SocketAuthParams;
    const { userId } = this.authService.parseJWT(token, personalToken);

    return { userId: userId ?? undefined };
  }

  async #notifyUserAboutNewMessage(client: Socket, chatId: number) {
    const roomName = String(chatId);

    client.to(roomName).emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
    client.broadcast
      .to(roomName)
      .emit(ChatSocketCommand.NOTIFY_ABOUT_NEW_MESSAGE);
  }

  @SubscribeMessage(FileVideoServerSocketKeys.UPLOAD_VIDEO_CHUNK)
  handleChunk(@MessageBody() chunk: Buffer) {
    this.fileVideoServerSocket.emit(
      FileVideoServerSocketKeys.UPLOAD_VIDEO_CHUNK,
      chunk,
    );
  }

  @SubscribeMessage(FileVideoServerSocketKeys.UPLOAD_VIDEO_END)
  handleUploadEnd() {
    this.fileVideoServerSocket.emit(FileVideoServerSocketKeys.UPLOAD_VIDEO_END);
  }
}
