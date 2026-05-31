import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core';
import { MessageCreateInputDto, MessageFilesInputDto, MessageFileVideoCreateDto, MessageUpdateInputDto } from './dtos';
import { Message, MessageFile, MessageStatus, SendFileMessageChatSocketParams } from '@circle-vibe/shared';
import { MessageFileEntityType, MessageFileType, MessageType, Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private databaseService: DatabaseService) {}

  async createMessage(messageInputDto: MessageCreateInputDto) {
    return this.databaseService.message.create({
      data: {
        content: messageInputDto.content,
        chatId: messageInputDto.chatId,
        senderId: messageInputDto.senderId,
        threadId: messageInputDto.threadId ?? null,
        hidden: false,
        messageType: messageInputDto.messageType,
        status: MessageStatus.UNREAD,
        removed: false,
        files: {
          create: messageInputDto?.files ?? [],
        },
      },
      include: {
        files: true,
        sender: true,
        thread: true,
      },
    }) as unknown as Promise<Message | null>;
  }

  async createFileVideoMessage(messageFileVideoCreatDto: MessageFileVideoCreateDto) {
    const { fileUrl, fileMeta, optimizedUrl, ...payload } = messageFileVideoCreatDto;
    const messagePart = await this.createMessage({
      ...payload,
      files: [],
      messageType: MessageType.VIDEO,
    });
    const messageId = Number(messagePart?.id);
    const uploadedFile = {
      entityType: fileMeta?.entityType ?? MessageFileEntityType.VIDEO,
      fileName: fileMeta.fileName,
      description: fileMeta.description ?? '',
      type: MessageFileType.MP4,
      url: fileUrl,
      optimizedUrl: fileUrl,
      messageId,
    };

    await this.databaseService.message.update({
      where: {
        id: messageId,
      },
      data: {
        files: {
          create: [uploadedFile],
        },
      },
    });

    await this.linkFileToMessage(messageId, uploadedFile);

    return this.databaseService.message.findUnique({
      where: {
        id: messageId,
      },
    });
  }

  setChatNotEmty(chatId: number) {
    return this.databaseService.chat.update({
      where: {
        id: chatId,
      },
      data: {
        empty: false,
      },
    });
  }

  async getChatBucket(chatId: number) {
    return this.databaseService.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        id: true,
        bucket: true,
      },
    });
  }

  composeMessagesQuery(
    paginationOptions: {
      take: number;
      skip: number;
    },
    entityFilters: {
      chatId: number;
      threadId?: number;
    },
    contentFilters: {
      filterByContent: object;
      filterBySenderIds: object;
    },
  ): Prisma.MessageFindManyArgs {
    const { take, skip } = paginationOptions ?? {};
    const { chatId, threadId } = entityFilters ?? {};
    const { filterByContent, filterBySenderIds } = contentFilters ?? {};
    return {
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        files: true,
        sender: {
          include: {
            user: true,
          },
        },
        thread: {
          include: {
            messages: true,
          },
        },
      },
      where: {
        chatId,
        removed: false,
        hidden: false,
        threadId: threadId ? Number(threadId) : null,
        ...filterByContent,
        ...filterBySenderIds,
      },
    };
  }

  async getMessagesByQuery(query: Prisma.MessageFindManyArgs) {
    return this.databaseService.message.findMany(query) as unknown as Message[];
  }

  async countMessagesWithFilters(
    chatId: number,
    filters: {
      filterByContent: object;
      filterBySenderIds: object;
    },
  ) {
    const { filterByContent, filterBySenderIds } = filters ?? {};

    return this.databaseService.message.count({
      where: {
        chatId,
        removed: false,
        hidden: false,
        ...filterByContent,
        ...filterBySenderIds,
      },
    });
  }

  async getThreadMessages(
    chatId: number,
    filters: {
      filterByContent: object;
      filterBySenderIds: object;
    },
  ) {
    const { filterByContent, filterBySenderIds } = filters ?? {};

    return (await this.databaseService.message.findMany({
      orderBy: { createdAt: 'asc' },
      where: {
        chatId,
        removed: false,
        hidden: false,
        threadId: {
          not: null,
        },
        ...filterByContent,
        ...filterBySenderIds,
      },
      include: {
        files: true,
        sender: {
          include: {
            user: true,
          },
        },
        thread: {
          include: {
            messages: true,
          },
        },
      },
    })) as unknown as Message[];
  }

  async getMessageById(chatId: number, messageId: number) {
    return this.databaseService.message.findUnique({
      where: {
        chatId,
        id: messageId,
      },
      include: {
        files: true,
        sender: true,
        thread: true,
      },
    }) as Promise<Message | null>;
  }

  async updateMessage(chatId: number, messageId: number, payload: MessageUpdateInputDto): Promise<Message | null> {
    await this.databaseService.message.update({
      where: {
        id: messageId,
        chatId,
      },
      data: {
        content: payload.content,
      },
    });

    return this.getUpdatedMessage(messageId);
  }

  getUpdatedMessage(messageId: number) {
    return this.databaseService.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        files: true,
        sender: true,
        thread: true,
      },
    }) as Promise<Message | null>;
  }

  async linkFileToMessage(messageId: number, file: Omit<MessageFile, 'id' | 'messageId'>) {
    const data = {
      ...file,
      messageId,
    };

    this.databaseService.messageFile.create({
      data,
    });
  }

  async getBlockedChartParticipants(currentUserId: number, chatId: number): Promise<number[]> {
    const blockedUsers = await this.databaseService.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        blockedUserIds: true,
      },
    });

    const blockedParticipants = await this.databaseService.chatParticipant.findMany({
      where: {
        chatId,
        userId: {
          in: blockedUsers?.blockedUserIds,
        },
      },
      select: {
        id: true,
      },
    });

    return blockedParticipants.map(({ id }) => id);
  }
}
