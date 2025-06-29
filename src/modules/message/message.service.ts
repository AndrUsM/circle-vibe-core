import { Injectable } from '@nestjs/common';

import { Message, MessageStatus, MessageType } from '@circle-vibe/shared';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessageFileVideoCreateDto,
  MessagePaginatedDto,
  MessagesPaginatedInputDto,
  UploadFileMetaInputDto,
} from './dtos';
import { DatabaseService } from 'src/core';
import {
  MessageFile,
  MessageFileEntityType,
  MessageFileType,
  Prisma,
} from '@prisma/client';
import {
  UploadFileOutputDto,
  UploadImageOutputDto,
  UploadVideoOutputDto,
} from 'src/core/services/file-service/dtos';
import { FileService } from 'src/core/services';
import { MessageFileCreateInputDto } from './dtos/message-file-create.dto';
import { SendFileMessageChatSocketParams } from 'src/gateways/chat/chat.gateway';

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
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { files: true },
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
    return this.databaseService.message.create({
      data: {
        content: params.content,
        chatId: params.chatId,
        senderId: params.senderId,
        threadId: params.threadId ?? null,
        hidden: false,
        messageType: params.messageType,
        status: MessageStatus.UNREAD,
        removed: false,
        files: {
          create: [],
        },
      },
    });
  }

  async createFileVideoMessage(
    messageFileVideoCreatDto: MessageFileVideoCreateDto,
  ) {
    const { fileUrl, fileMeta, optimizedUrl, ...payload } =
      messageFileVideoCreatDto;
    const messagePart = await this.create({
      ...payload,
      files: [],
      messageType: MessageType.VIDEO,
    });
    const messageId = messagePart.id;
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

  async createFileMessage(payload: SendFileMessageChatSocketParams) {
    const {fileUrl, fileMeta, optimizedUrl, ...params} = payload;
    const messagePart = await this.create({
      ...params,
      files: [],
    });
    const messageId = messagePart.id;
    const uploadedFile = {
      entityType: fileMeta?.entityType ?? MessageFileEntityType.FILE,
      fileName: fileMeta.fileName,
      description: fileMeta.description ?? '',
      type: fileMeta.type,
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

  async linkFileToMessage(
    messageId: number,
    file: Omit<MessageFile, 'id' | 'messageId'>,
  ) {
    const data: Prisma.MessageFileCreateInput = {
      ...file,
      messageId,
    };

    this.databaseService.messageFile.create({
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
    const optimisedFilePath = (outputDto as UploadVideoOutputDto)
      ?.optimisedFilePath;

    return {
      url: filePath,
      optimizedUrl: optimisedFilePath ?? '',
      fileName,
      description,
      type,
      messageId,
      entityType: entityType ?? MessageFileEntityType.FILE,
    };
  }

  async #uploadFile(
    file: File,
    fileMeta: UploadFileMetaInputDto,
    messageId: number,
  ): Promise<Omit<MessageFile, 'id'>> {
    const response = await this.uploadFileByEntityType(
      {
        ...fileMeta,
        file: new File([file], fileMeta.fileName, {
          type: fileMeta.fileType,
        }),
        entityType: fileMeta?.entityType ?? MessageFileEntityType.FILE,
        fileName: fileMeta.fileName,
        description: fileMeta.description ?? '',
        url: '',
        type: fileMeta.type as MessageFileType,
      },
      messageId,
    );

    return response as Omit<MessageFile, 'id'>;
  }
}
