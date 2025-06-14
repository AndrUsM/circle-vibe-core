import { Injectable } from '@nestjs/common';

import { Message, MessageStatus } from '@circle-vibe/shared';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessagePaginatedDto,
  MessagesPaginatedInputDto,
} from './dtos';
import { DatabaseService } from 'src/core';
import { MessageFile, MessageFileEntityType, Prisma } from '@prisma/client';
import {
  UploadFileOutputDto,
  UploadImageOutputDto,
  UploadVideoOutputDto,
} from 'src/core/services/file-service/dtos';
import { FileService } from 'src/core/services';

@Injectable()
export class MessageService {
  constructor(
    private databaseService: DatabaseService,
    private fileService: FileService,
  ) {}

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
    const messagePart = await this.databaseService.message.create({
      data: {
        ...params,
        threadId: params.threadId ?? 0,
        status: MessageStatus.DRAFT,
        removed: false,
        files: {
          create: [],
        },
      },
    });

    const messageId = messagePart.id;

    const files = params.files?.length
      ? await this.#uploadFiles(params.files, messageId)
      : [];

    await this.databaseService.message.update({
      where: {
        id: messageId,
      },
      data: {
        files: {
          create: files,
        },
      },
    });

    await this.linkFilesToMessage(messageId, params.files ?? []);

    const message = await this.databaseService.message.findUnique({
      where: {
        id: messageId,
      },
    });

    return message;
  }

  async linkFilesToMessage(messageId: number, files: MessageFilesInputDto[]) {
    const data = files.map((file) => ({
      ...file,
      messageId,
    }));

    this.databaseService.messageFile.createMany({
      data,
    });
  }

  async uploadFileByEntityType(
    messageFilesInputDto: MessageFilesInputDto,
    messageId: number,
  ) {
    const { entityType, file } = messageFilesInputDto;
    if (entityType === MessageFileEntityType.FILE) {
      const response = (await this.fileService.uploadFile(
        file,
      )) as UploadFileOutputDto;

      return this.#mapUploadedFileToMessageFile(
        response,
        messageFilesInputDto,
        messageId,
      );
    }

    if (entityType === MessageFileEntityType.IMAGE) {
      const response = (await this.fileService.uploadImage(
        file,
      )) as UploadImageOutputDto;

      return this.#mapUploadedFileToMessageFile(
        response,
        messageFilesInputDto,
        messageId,
      );
    }

    if (entityType === MessageFileEntityType.VIDEO) {
      const response = (await this.fileService.uploadVideo(
        file,
      )) as UploadVideoOutputDto;

      return this.#mapUploadedFileToMessageFile(
        response,
        messageFilesInputDto,
        messageId,
      );
    }
  }

  #mapUploadedFileToMessageFile(
    outputDto:
      | UploadFileOutputDto
      | UploadVideoOutputDto
      | UploadImageOutputDto,
    messageFilesInputDto: MessageFilesInputDto,
    messageId: number,
  ) {
    const { fileName, description, type, entityType } = messageFilesInputDto;
    const { filePath } = outputDto;

    return {
      url: filePath,
      fileName,
      description,
      type,
      messageId,
      entityType: entityType ?? MessageFileEntityType.FILE,
    };
  }

  async #uploadFiles(
    files: MessageFilesInputDto[],
    messageId: number,
  ): Promise<Omit<MessageFile, 'id'>[]> {
    return Promise.all(
      files.map(async (payload) => {
        const response = await this.uploadFileByEntityType(
          {
            ...payload,
            entityType: payload?.entityType ?? MessageFileEntityType.FILE,
          },
          messageId,
        );

        return response as Omit<MessageFile, 'id'>;
      }),
    );
  }
}
