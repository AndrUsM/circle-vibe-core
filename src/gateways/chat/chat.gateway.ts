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
  SendFileMessageChatSocketParams,
  RequestMessagesWithPaginationChatSocketParams,
  RequestChatsWithPaginationChatSocketParams,
  RequestChatParticipantsWithPagniationSocketParams,
  DEFAULT_PAGINATION_PAGE_SIZE,
  convertContentFromBase64,
} from '@circle-vibe/shared';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guards';
import {
  AuthService,
  ChatService,
  MessageService,
  ParticipantGatewayStateService,
  UserService,
} from 'src/modules';
import { SocketAuthParams } from 'src/guards/ws-auth-guard/params';
import { ParticipantService } from 'src/modules/participant/participant.service';
import { MessageFileVideoCreateDto } from 'src/modules/message/dtos';
import { FILE_VIDEO_SOCKET_URL } from 'src/configuration';

@WebSocketGateway(3002, {
  cors: true,
  namespace: `/${GatewayNamespaces.CHAT_MAIN}`,
  transports: ['websocket'],
  httpCompression: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  #dataLimit = DEFAULT_PAGINATION_PAGE_SIZE;

  fileVideoServerSocket = io(FILE_VIDEO_SOCKET_URL);

  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly participantService: ParticipantService,
    private readonly participantGatewayStateService: ParticipantGatewayStateService,
  ) {}

  @UseGuards(WsAuthGuard)
  async handleDisconnect(client: Socket) {
    const userId = await this.#getCurrentUserState(client);

    if (!userId) {
      return;
    }

    await this.userService.changeUserChatStatus(userId, UserChatStatus.OFFLINE);
    await this.participantGatewayStateService.deleteByUserId(userId);
  }

  @UseGuards(WsAuthGuard)
  async handleConnection(client: Socket, ...args: any[]) {
    const { userId } = await this.#getAuthParams(client);

    if (!userId) {
      return;
    }

    const userFromState =
      await this.participantGatewayStateService.getByUserId(userId);

    if (!userFromState) {
      await this.participantGatewayStateService.create({
        userId,
        clientId: client.id,
      });
    } else {
      const clientId = userFromState?.clientId;

      await this.participantGatewayStateService.delete({ clientId });
      await this.participantGatewayStateService.create({
        userId,
        clientId: client.id,
      });
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

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
    );

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

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
    );

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);

    this.#notifyUserAboutNewMessage(client, chatId);
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
      content: convertContentFromBase64(message.content),
      files: [],
    });

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
    );

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

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
    );

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
    const userId = await this.#getCurrentUserState(client);
    const roomName = String(chatId);

    if (!userId) {
      return;
    }

    const chatParticipant = await this.participantService.getChatParticipants({
      chatId,
      userId,
    });

    const messagesForChat =
      await this.messageService.getMessagesByChatPaginated(chatId, {
        pageSize: this.#dataLimit,
        page: 1,
      });

    client.join(roomName);

    client.emit(ChatSocketCommand.JOIN_CHAT, { chatParticipant });
    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messagesForChat);
    client.emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.CREATE_CHAT)
  async handleCreateChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatInputDto: CreateChatSocketParams,
  ) {
    const userId = await this.#getCurrentUserState(client);

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

    const chats = await this.chatService.getAllPaginated({
      userId,
      pageSize: this.#dataLimit,
      page: 1,
    });

    client.emit(ChatSocketCommand.RECEIVE_CHATS, chats);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REQUEST_MESSAGES_WITH_PAGINATION)
  async requestMessagesWithPagination(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: RequestMessagesWithPaginationChatSocketParams,
  ) {
    const { chatId, page, pageSize } = params;

    const chats = await this.messageService.getMessagesByChatPaginated(chatId, {
      page,
      pageSize,
    });

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, chats);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REQUEST_CHATS_WITH_PAGINATION)
  async requestChatsWithPagination(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: RequestChatsWithPaginationChatSocketParams,
  ) {
    const { userId, page, pageSize } = params;

    const chats = await this.chatService.getAllPaginated({
      name: params?.name,
      userId,
      page,
      pageSize,
    });

    client.emit(ChatSocketCommand.RECEIVE_CHATS, chats);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REQUEST_CHAT_PARTICIPANTS_WITH_PAGINATION)
  async requestChatParticipantsWithPagination(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: RequestChatParticipantsWithPagniationSocketParams,
  ) {
    const chatParticipants =
      await this.participantService.getChatParticipants(params);

    client.emit(ChatSocketCommand.RECEIVE_CHAT_PARTICIPANTS, chatParticipants);
    client.emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.RECEIVE_CHATS)
  async handleRefreshChats(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName?: string,
  ) {
    const userId = await this.#getCurrentUserState(client);

    if (!userId) {
      return;
    }

    const chats = await this.chatService.getAllPaginated({
      userId,
      pageSize: this.#dataLimit,
      page: 1,
    });

    if (roomName) {
      this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_CHATS, chats);

      return;
    }

    client.emit(ChatSocketCommand.RECEIVE_CHATS, chats);
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

  async #getAuthParams(socket: Socket) {
    const { token, personalToken } = (socket.handshake.auth ??
      {}) as SocketAuthParams;

    try {
      const { userId } = this.authService.parseJWT(token, personalToken);

      return { userId: userId ?? undefined };
    } catch (error) {
      const userId = await this.#refreshToken(socket, token);

      return {
        userId,
      };
    }
  }

  async #refreshToken(
    socket: Socket,
    authToken: string,
  ): Promise<number | undefined> {
    const userId = this.authService.decodeJWT(authToken)?.userId;

    if (!userId) {
      return undefined;
    }

    const user = await this.userService.getById(userId);

    if (!user) {
      return undefined;
    }

    const token = this.authService.generateJWT(user);

    if (!token) {
      return undefined;
    }

    socket.emit(ChatSocketCommand.REFRESH_TOKEN, token);

    return userId;
  }

  async #notifyUserAboutNewMessage(client: Socket, chatId: number) {
    const roomName = String(chatId);

    client.broadcast
      .to(roomName)
      .emit(ChatSocketCommand.NOTIFY_ABOUT_NEW_MESSAGE);
    client.emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
  }

  async #getCurrentUserState(client: Socket) {
    const { userId: fallbackUserId } = await this.#getAuthParams(client);
    const clientId = client.id;

    const state =
      await this.participantGatewayStateService.getByClientId(clientId);

    return state?.userId ?? fallbackUserId ?? null;
  }
}
