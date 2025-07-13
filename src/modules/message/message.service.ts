import { Injectable } from '@nestjs/common';

import {
  Message,
  MessageStatus,
  MessageType,
  UploadFileOutputDto,
  UploadImageOutputDto,
  SendFileMessageChatSocketParams,
  UploadVideoOutputDto,
  PaginatedResponse,
} from '@circle-vibe/shared';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessageFileVideoCreateDto,
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
import { FileService } from 'src/core/services';

@Injectable()
export class MessageService {
  constructor(
    private databaseService: DatabaseService,
    private fileService: FileService,
  ) {}

  async getMessagesByChatPaginated(
    chatId: number,
    params: MessagesPaginatedInputDto,
  ): Promise<PaginatedResponse<Message>> {
    const { page, pageSize } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const query: Prisma.MessageFindManyArgs = {
      orderBy: { createdAt: 'asc' },
      take,
      skip,
      include: {
        files: true,
        sender: {
          include: {
            user: true,
          },
        },
        thread: true,
      },
      where: {
        chatId,
        removed: false,
        hidden: false,
      },
    };

    const totalItems = await this.databaseService.message.count({
      where: {
        chatId,
        removed: false,
        hidden: false,
      },
    });

    const items = await this.databaseService.message.findMany(query);

    return {
      data: (items ?? []) as unknown as Message[],
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
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
    const { fileUrl, fileMeta, optimizedUrl, ...params } = payload;
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
