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

import {
  ChatSocketCommand,
  CreateChatSocketParams,
  JoinChatSocketParams,
  RefreshChatsSocketParams,
  SendMessageChatSocketParams,
  UserChatStatus,
  GatewayNamespaces,
  SendFileMessageChatSocketParams,
  RequestMessagesWithPaginationChatSocketParams,
  RequestChatsWithPaginationChatSocketParams,
  RequestChatParticipantsWithPagniationSocketParams,
  DEFAULT_PAGINATION_PAGE_SIZE,
  convertContentFromBase64,
  NotifyAboutTypingSocketParams,
} from '@circle-vibe/shared';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guards';
import {
  ChatService,
  MessageService,
  ParticipantGatewayStateService,
  ThreadService,
  UserService,
} from 'src/modules';
import { ParticipantService } from 'src/modules/participant/participant.service';
import { MessageFileVideoCreateDto } from 'src/modules/message/dtos';
import { ChatGatewayService } from './chat-gateway.service';

@WebSocketGateway(3002, {
  cors: true,
  namespace: `/${GatewayNamespaces.CHAT_MAIN}`,
  transports: ['websocket'],
  httpCompression: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  #dataLimit = DEFAULT_PAGINATION_PAGE_SIZE;

  constructor(
    private chatGatewayService: ChatGatewayService,

    private readonly threadService: ThreadService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly participantService: ParticipantService,
    private readonly participantGatewayStateService: ParticipantGatewayStateService,
  ) {}

  @UseGuards(WsAuthGuard)
  async handleDisconnect(client: Socket) {
    const userId = await this.chatGatewayService.getCurrentUserState(client);

    if (!userId) {
      return;
    }

    await this.userService.changeUserChatStatus(userId, UserChatStatus.OFFLINE);
    await this.participantGatewayStateService.deleteByUserId(userId);
  }

  @UseGuards(WsAuthGuard)
  async handleConnection(client: Socket, ...args: any[]) {
    this.chatGatewayService.handleConnection(client, ...args);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.RECEIVE_MESSAGES)
  async handleReceiveMessages(
    @MessageBody() data: RefreshChatsSocketParams,
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId } = data;
    const roomName = String(chatId);
    const currentUserId = await this.chatGatewayService.getCurrentUserState(client);

    if (!currentUserId) {
      return;
    }

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
      { threadId: data.threadId, currentUserId },
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
    const currentUserId = await this.chatGatewayService.getCurrentUserState(client);

    if (!currentUserId) {
      return;
    }

    await this.messageService.createFileVideoMessage(data);

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
      {
        threadId: data.threadId,
        currentUserId,
      },
    );

    this.server.to(roomName).emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);

    this.#notifyUserAboutNewMessage(client, chatId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.MESSAGE_TYPE_START_TYPING)
  async handleNotifyAboutTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: NotifyAboutTypingSocketParams,
  ) {
    const roomName = String(params.chatId);
    client.broadcast
      .to(roomName)
      .emit(ChatSocketCommand.MESSAGE_TYPE_START_TYPING, params);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.MESSAGE_TYPE_STOP_TYPING)
  async handleNotifyAboutTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: NotifyAboutTypingSocketParams,
  ) {
    const roomName = String(params.chatId);
    client.broadcast
      .to(roomName)
      .emit(ChatSocketCommand.MESSAGE_TYPE_STOP_TYPING, params);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageChatSocketParams,
  ) {
    const chatId = data.chatId;
    const roomName = String(chatId);
    const message = data;
    const currentUserId = await this.chatGatewayService.getCurrentUserState(client);

    if (!currentUserId) {
      return;
    }

    await this.messageService.create({
      ...message,
      content: convertContentFromBase64(message.content),
      files: [],
    });

    const messages = await this.chatGatewayService.getMessageByChat(chatId, {
      currentUserId
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
    const currentUserId = await this.chatGatewayService.getCurrentUserState(client);

    if (!currentUserId) {
      return;
    }

    await this.messageService.createFileMessage(params);

    const messages = await this.chatGatewayService.getMessageByChat(chatId, {
      currentUserId
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
    const { chatId } = params;
    const userId = await this.chatGatewayService.getCurrentUserState(client);
    const roomName = String(chatId);

    if (!userId) {
      return;
    }

    const { chatParticipant, messagesForChat } =
      await this.chatGatewayService.joinChat(chatId, userId);

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
    const userId = await this.chatGatewayService.getCurrentUserState(client);

    if (!userId) {
      return;
    }

    const chats = await this.chatGatewayService.createChat(
      userId,
      chatInputDto,
    );

    client.emit(ChatSocketCommand.RECEIVE_CHATS, chats);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(ChatSocketCommand.REQUEST_MESSAGES_WITH_PAGINATION)
  async requestMessagesWithPagination(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: RequestMessagesWithPaginationChatSocketParams,
  ) {
    const { chatId, page, content, pageSize, senderIds, threadId } = params;
    const currentUserId = await this.chatGatewayService.getCurrentUserState(client);

    if (!currentUserId) {
      return;
    }

    const messages = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        page,
        pageSize,
      },
      {
        threadId,
        content,
        senderIds,
        currentUserId
      }
    );

    client.emit(ChatSocketCommand.RECEIVE_MESSAGES, messages);
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
    const userId = await this.chatGatewayService.getCurrentUserState(client);

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

  async #notifyUserAboutNewMessage(client: Socket, chatId: number) {
    const roomName = String(chatId);

    client.broadcast
      .to(roomName)
      .emit(ChatSocketCommand.NOTIFY_ABOUT_NEW_MESSAGE);
    client.emit(ChatSocketCommand.SCROLL_TO_END_OF_MESSAGES);
  }
}
