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
  MessageFile,
} from '@circle-vibe/shared';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessageFileVideoCreateDto,
  MessagesPaginatedInputDto,
  MessageUpdateInputDto,
} from './dtos';
import { DatabaseService } from 'src/core';
import { MessageFileEntityType, MessageFileType, Prisma } from '@prisma/client';
import { FileService } from 'src/core/services';
import { GetMessagesByChatPaginatedParams } from './params';

@Injectable()
export class MessageService {
  constructor(
    private databaseService: DatabaseService,
    private fileService: FileService,
  ) {}

  async getMessagesByChatPaginated(
    chatId: number,
    params: MessagesPaginatedInputDto,
    filters?: GetMessagesByChatPaginatedParams,
  ): Promise<PaginatedResponse<Message>> {
    const { page, pageSize } = params;
    const threadId = filters?.threadId;
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
      },
    };

    const totalItems = await this.databaseService.message.count({
      where: {
        chatId,
        removed: false,
        hidden: false,
      },
    });

    const items = (await this.databaseService.message.findMany(
      query,
    )) as Message[];
    const threadMessages = (await this.databaseService.message.findMany({
      orderBy: { createdAt: 'asc' },
      where: {
        chatId,
        removed: false,
        hidden: false,
        threadId: {
          not: null,
        },
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

    const mappedMessages = (items ?? []).map((message) => {
      return this.#mapMessagesToOutputDto(message, threadMessages);
    });

    return {
      data: mappedMessages,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async create(params: MessageCreateInputDto): Promise<Message | null> {
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
      include: {
        files: true,
        sender: true,
        thread: true,
      },
    }) as unknown as Promise<Message | null>;
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
      },
    }) as Promise<Message | null>;
  }

  async updateMessage(
    chatId: number,
    messageId: number,
    payload: MessageUpdateInputDto,
  ): Promise<Message | null> {
    await this.databaseService.message.update({
      where: {
        id: messageId,
        chatId,
      },
      data: {
        content: payload.content,
      },
    });

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

  async createFileMessage(
    payload: SendFileMessageChatSocketParams,
  ): Promise<Message | null> {
    const { fileUrl, fileMeta, optimizedUrl, ...params } = payload;
    const messagePart = await this.create({
      ...params,
      files: [],
    });
    const messageId = Number(messagePart?.id);
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
      include: {
        files: true,
        sender: true,
        thread: true,
      },
    }) as Promise<Message | null>;
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

  #mapMessagesToOutputDto(
    message: Message,
    threadMessages: Message[],
  ): Message {
    const threads = message?.childThreadId
      ? threadMessages
          .filter((thread) => thread.threadId === message?.childThreadId)
          .map((thread) => this.#mapMessageToOutputDto(thread))
      : [];

    return {
      ...message,
      threads,
      files: message.files.map((file) => this.#mapMessageFileToOutputDto(file)),
    } as unknown as Message;
  }

  #mapMessageToOutputDto(message: Message) {
    return {
      ...message,
      threads: [],
      files: message.files.map((file) => this.#mapMessageFileToOutputDto(file)),
    } as unknown as Message;
  }

  #mapMessageFileToOutputDto(messageFile: MessageFile): MessageFile {
    return {
      ...messageFile,
      url: this.fileService.composeFileUrl(messageFile.url),
      optimizedUrl: this.fileService.composeFileUrl(messageFile.optimizedUrl),
    } as MessageFile;
  }
}
