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
  MessageUpdateInputDto,
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
    const mappedMessages = (items ?? []).map((message: Message) => {
      return {
        ...message,
        files: message.files.map((file) => {
          return {
            ...file,
            url: this.fileService.composeFileUrl(file.url),
            optimizedUrl: this.fileService.composeFileUrl(file.optimizedUrl),
          } as MessageFile;
        }),
      } as Message;
    });

    return {
      data: mappedMessages,
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

  getMessageById(id: number, chatId: number) {
    return this.databaseService.message.findUnique({
      where: {
        chatId,
        id,
      },
      include: {
        files: true,
        sender: true,
        thread: true,
      }
    }) as Promise<Message | null>;
  }

  async updateMessage(chatId: number, messageId: number, payload: MessageUpdateInputDto): Promise<Message | null> {
    // const query: string = `UPDATE "Message" SET "content" = '${payload.content}' WHERE "id" = ${messageId} AND "chatId" = ${chatId}`;

    // const query: string = `UPDATE "Message" SET "content" = '${payload.content}' WHERE "id" = ${messageId} AND "chatId" = ${chatId};`;

    // await this.databaseService.$queryRaw`${query}`;
    await this.databaseService.message.update({
      where: {
        id: messageId,
        chatId,
      },
      data: {
        content: payload.content,
      },
    })

    return this.databaseService.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        files: true,
        sender: true,
        thread: true,
      }
    }) as Promise<Message | null>;
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


}
