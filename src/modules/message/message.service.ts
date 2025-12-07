import { Injectable } from '@nestjs/common';
import {
  MessageFileEntityType,
  MessageFileType,
  Prisma,
  User,
} from '@prisma/client';

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
  ConversationBucketNameEnum,
} from '@circle-vibe/shared';

import { DatabaseService } from 'src/core';
import { FileService } from 'src/core/services';
import {
  MessageCreateInputDto,
  MessageFilesInputDto,
  MessageFileVideoCreateDto,
  MessagesPaginatedInputDto,
  MessageUpdateInputDto,
} from './dtos';
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
    const blockedChatParticipants = await this.#getBlockedChartParticipants(
      filters?.currentUserId as number,
      chatId,
    );
    const filterByContent = filters?.content?.length
      ? { content: { contains: filters.content } }
      : {};

    const filterBySenderIds = filters?.senderIds?.length
      ? { senderId: { in: filters.senderIds } }
      : { senderId: { notIn: blockedChatParticipants } };

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
        ...filterByContent,
        ...filterBySenderIds,
      },
    };

    const totalItems = await this.databaseService.message.count({
      where: {
        chatId,
        removed: false,
        hidden: false,
        ...filterByContent,
        ...filterBySenderIds,
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

    const bucketInformation = await this.databaseService.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        id: true,
        bucket: true,
      },
    });

    if (!bucketInformation?.bucket) {
      return {
        data: [],
        totalItems,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const mappedMessages = (items ?? []).map((message) =>
      this.#mapMessagesToOutputDto(
        message,
        threadMessages,
        bucketInformation.bucket,
      ),
    );

    return {
      data: mappedMessages,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async create(params: MessageCreateInputDto): Promise<Message | null> {
    await this.databaseService.chat.update({
      where: {
        id: params.chatId,
      },
      data: {
        empty: false,
      },
    });

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
    const data = {
      ...file,
      messageId,
    };

    this.databaseService.messageFile.create({
      data
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

  async #getBlockedChartParticipants(
    currentUserId: number,
    chatId: number,
  ): Promise<number[]> {
    const blockedUsers = await this.databaseService.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        blockedUserIds: true,
      },
    });

    const blockedParticipants =
      await this.databaseService.chatParticipant.findMany({
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
    bucket: string,
  ): Message {
    const threads = message?.childThreadId
      ? threadMessages
          .filter((thread) => thread.threadId === message?.childThreadId)
          .map((thread) => this.#mapMessageToOutputDto(thread, bucket))
      : [];

    return {
      ...message,
      sender: {
        ...message.sender,
        user: {
          ...message.sender.user,
          ...this.#mapUserAvatarToOutputDto(message.sender.user),
        },
      },
      threads,
      files: message.files.map((file) =>
        this.#mapMessageFileToOutputDto(file, bucket),
      ),
    } as unknown as Message;
  }

  #mapMessageToOutputDto(message: Message, bucket: string) {
    return {
      ...message,
      threads: [],
      sender: {
        ...message.sender,
        user: {
          ...message.sender.user,
          ...this.#mapUserAvatarToOutputDto(message.sender.user),
        },
      },
      files: message.files.map((file) =>
        this.#mapMessageFileToOutputDto(file, bucket),
      ),
    } as unknown as Message;
  }

  #mapUserAvatarToOutputDto(user: User): Partial<User> {
    return {
      ...user,
      avatarUrl: user.avatarUrl
        ? this.fileService.composeFileUrl(
            user.avatarUrl,
            ConversationBucketNameEnum.USER_AVATARS,
          )
        : null,
      avatarUrlOptimized: user.avatarUrlOptimized
        ? this.fileService.composeFileUrl(
            user.avatarUrlOptimized,
            ConversationBucketNameEnum.USER_AVATARS,
          )
        : null,
    } as User;
  }

  #mapMessageFileToOutputDto(
    messageFile: MessageFile,
    bucket: string,
  ): MessageFile {
    return {
      ...messageFile,
      url: this.fileService.composeFileUrl(messageFile.url, bucket),
      optimizedUrl: this.fileService.composeFileUrl(
        messageFile.optimizedUrl,
        bucket,
      ),
    } as MessageFile;
  }
}
