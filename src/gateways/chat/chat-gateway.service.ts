import { ChatSocketCommand, CreateChatSocketParams, DEFAULT_PAGINATION_PAGE_SIZE, UserChatStatus } from '@circle-vibe/shared';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SocketAuthParams } from 'src/guards/ws-auth-guard/params';
import { MessageService, ChatService, AuthService, UserService, ParticipantService, ParticipantGatewayStateService } from 'src/modules';
import { GetMessagesByChatPaginatedParams } from 'src/modules/message/params/get-messages-by-chat-paginated.params';

@Injectable()
export class ChatGatewayService {
  #dataLimit = DEFAULT_PAGINATION_PAGE_SIZE;

  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly participantService: ParticipantService,
    private readonly participantGatewayStateService: ParticipantGatewayStateService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const { userId } = await this.getAuthParams(client);

    if (!userId) {
      return;
    }

    const userFromState = await this.participantGatewayStateService.getByUserId(userId);

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

  async getAuthParams(socket: Socket) {
    const { token, personalToken } = (socket.handshake.auth ?? {}) as SocketAuthParams;

    try {
      const { userId } = this.authService.parseJWT(token, personalToken);

      return { userId: userId ?? undefined };
    } catch (error) {
      const userId = await this.refreshToken(socket, token);

      return {
        userId,
      };
    }
  }

  async refreshToken(socket: Socket, authToken: string): Promise<number | undefined> {
    const userId = this.authService.decodeJWT(authToken)?.userId;

    if (!userId) {
      return undefined;
    }

    const user = await this.userService.getById(userId);
    const token = user ? this.authService.generateJWT(user) : null;

    if (user && token) {
      return undefined;
    }

    socket.emit(ChatSocketCommand.REFRESH_TOKEN, token);

    return userId;
  }

  async joinChat(chatId: number, userId: number) {
    const chatParticipant = await this.participantService.getChatParticipant({
      chatId,
      userId,
    });

    const messagesForChat = await this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
      {
        currentUserId: userId,
      },
    );

    return {
      messagesForChat,
      chatParticipant,
    };
  }

  async createChat(userId: number, chatInputDto: CreateChatSocketParams) {
    const chat = await this.chatService.create({
      ...chatInputDto,
      usersLimit: 100,
    });

    await this.participantService.getOrCreateChatParticipant({
      chatId: chat.id,
      userId,
    });

    const chats = await this.chatService.getAllPaginated({
      userId: [userId],
      pageSize: this.#dataLimit,
      page: 1,
    });

    return chats;
  }

  async getCurrentUserState(client: Socket) {
    const { userId: fallbackUserId } = await this.getAuthParams(client);
    const clientId = client.id;

    const state = await this.participantGatewayStateService.getByClientId(clientId);

    return state?.userId ?? fallbackUserId ?? null;
  }

  async getMessageByChat(chatId: number, filters?: GetMessagesByChatPaginatedParams) {
    return this.messageService.getMessagesByChatPaginated(
      chatId,
      {
        pageSize: this.#dataLimit,
        page: 1,
      },
      filters,
    );
  }
}
