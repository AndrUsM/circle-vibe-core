import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { Message, MessageStatus } from '@circle-vibe/shared';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessagePaginatedDto,
  MessagesPaginatedInputDto,
} from './dtos';
import { DatabaseService } from 'src/core';

@Injectable()
export class MessageService {
  constructor(private databaseService: DatabaseService) {}

  async getMessagesByChat(
    chatId: number,
    params: MessagesPaginatedInputDto,
  ): Promise<MessagePaginatedDto<Message>> {
    const { limit, cursor } = params;

    const query: Prisma.MessageFindManyArgs = {
      orderBy: { createdAt: 'desc' },
      take: limit,
    };

    if (cursor) {
      query.skip = 1;
      query.cursor = { id: cursor };
    }

    const total = await this.databaseService.message.count({
      where: {
        chatId,
      },
    });

    const items = await this.databaseService.message.findMany(query);

    const nextCursor =
      items.length === limit ? items[items.length - 1].id : null;

    return {
      data: items as Message[],
      nextCursor,
      hasNextPage: Boolean(nextCursor),
      total,
      limit,
    };
  }

  async create(params: MessageCreateInputDto) {
    const emptyFiles = {
      create: [],
    };

    const messagePart = await this.databaseService.message.create({
      data: {
        ...params,
        threadId: params.threadId ?? 0,
        status: MessageStatus.DRAFT,
        removed: false,
        files: emptyFiles,
      },
    });

    await this.linkFilesToMessage(messagePart.id, params.files ?? []);

    const message = await this.databaseService.message.findFirstOrThrow({
      where:{
        id: messagePart.id
      }
    })

    return message;
  }

  async linkFilesToMessage(messageId: number, files: MessageFilesInputDto[]) {
    const data = files.map((file) => ({
      ...file,
      messageId,
    })) as Prisma.MessageFileCreateWithoutMessageInput[];

    this.databaseService.messageFile.createMany({
      data,
    });
  }
}
