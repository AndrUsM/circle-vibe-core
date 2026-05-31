import { Injectable } from '@nestjs/common';
import { MessageFileEntityType, Prisma } from '@prisma/client';

import { Message, SendFileMessageChatSocketParams, PaginatedResponse } from '@circle-vibe/shared';

import { MessageCreateInputDto, MessageFilesInputDto, MessagesPaginatedInputDto, MessageUpdateInputDto } from './dtos';
import { GetMessagesByChatPaginatedParams } from './params';
import { MessageRepository } from './message.repository';
import { MessageMappers } from './message.mappers';

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private messageMappers: MessageMappers,
  ) {}

  async getMessagesByChatPaginated(chatId: number, params: MessagesPaginatedInputDto, filters?: GetMessagesByChatPaginatedParams): Promise<PaginatedResponse<Message>> {
    const { page, pageSize } = params;
    const threadId = filters?.threadId;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const blockedChatParticipants = await this.messageRepository.getBlockedChartParticipants(filters?.currentUserId as number, chatId);
    const filterByContent = filters?.content?.length ? { content: { contains: filters.content } } : {};

    const filterBySenderIds = filters?.senderIds?.length ? { senderId: { in: filters.senderIds } } : { senderId: { notIn: blockedChatParticipants } };

    const query: Prisma.MessageFindManyArgs = this.messageRepository.composeMessagesQuery(
      {
        skip,
        take,
      },
      { chatId, threadId },
      {
        filterByContent,
        filterBySenderIds,
      },
    );

    const totalItems = await this.messageRepository.countMessagesWithFilters(chatId, {
      filterByContent,
      filterBySenderIds,
    });

    const items = await this.messageRepository.getMessagesByQuery(query);
    const threadMessages = await this.messageRepository.getThreadMessages(chatId, {
      filterByContent,
      filterBySenderIds,
    });

    const bucketInformation = await this.messageRepository.getChatBucket(chatId);

    if (!bucketInformation?.bucket) {
      return {
        data: [],
        totalItems,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const mappedMessages = (items ?? []).map((message) => this.messageMappers.mapMessagesToOutputDto(message, threadMessages, bucketInformation.bucket));

    return {
      data: mappedMessages,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async create(params: MessageCreateInputDto): Promise<Message | null> {
    await this.messageRepository.setChatNotEmty(params.chatId);

    return this.messageRepository.createMessage(params);
  }

  getMessageById(id: number, chatId: number) {
    return this.messageRepository.getMessageById(chatId, id);
  }

  async updateMessage(chatId: number, messageId: number, payload: MessageUpdateInputDto): Promise<Message | null> {
    return this.messageRepository.updateMessage(chatId, messageId, payload);
  }

  async createFileMessage(payload: SendFileMessageChatSocketParams): Promise<Message | null> {
    const { fileUrl, fileMeta, optimizedUrl, ...params } = payload;
    const uploadedFileInputDto = {
      entityType: fileMeta?.entityType ?? MessageFileEntityType.FILE,
      fileName: fileMeta.fileName,
      description: fileMeta.description ?? '',
      type: fileMeta.type,
      url: fileUrl,
      optimizedUrl: fileUrl,
    } as unknown as MessageFilesInputDto;

    const baseMessagePart = await this.create({
      ...params,
      files: [uploadedFileInputDto],
    });
    const messageId = Number(baseMessagePart?.id);

    await this.messageRepository.linkFileToMessage(messageId, uploadedFileInputDto);

    return this.messageRepository.getUpdatedMessage(messageId);
  }
}
