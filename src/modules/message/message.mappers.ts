import { ConversationBucketNameEnum, Message, MessageFile, MessageFileEntityType, UploadFileOutputDto, UploadImageOutputDto, UploadVideoOutputDto, User } from '@circle-vibe/shared';
import { Injectable } from '@nestjs/common';
import { FileService } from 'src/core/services';
import { MessageFilesInputDto } from './dtos';

@Injectable()
export class MessageMappers {
  constructor(private fileService: FileService) {}

  mapUserAvatarToOutputDto(user: Omit<User, 'accountStatus'>): Partial<User> {
    return {
      ...user,
      avatarUrl: user.avatarUrl ? this.fileService.composeFileUrl(user.avatarUrl, ConversationBucketNameEnum.USER_AVATARS) : null,
      avatarUrlOptimized: user.avatarUrlOptimized ? this.fileService.composeFileUrl(user.avatarUrlOptimized, ConversationBucketNameEnum.USER_AVATARS) : null,
    } as User;
  }

  mapMessagesToOutputDto(message: Message, threadMessages: Message[], bucket: string): Message {
    const threads = message?.childThreadId ? threadMessages.filter((thread) => thread.threadId === message?.childThreadId).map((thread) => this.mapMessageToOutputDto(thread, bucket)) : [];

    return {
      ...message,
      sender: {
        ...message.sender,
        user: {
          ...message.sender.user,
          ...this.mapUserAvatarToOutputDto(message?.sender?.user),
        },
      },
      threads,
      files: message.files.map((file) => this.mapMessageFileToOutputDto(file, bucket)),
    };
  }

  mapMessageToOutputDto(message: Message, bucket: string) {
    return {
      ...message,
      threads: [],
      sender: {
        ...message.sender,
        user: {
          ...message.sender.user,
          ...this.mapUserAvatarToOutputDto(message.sender.user),
        },
      },
      files: message.files.map((file) => this.mapMessageFileToOutputDto(file, bucket)),
    } as unknown as Message;
  }

  mapMessageFileToOutputDto(messageFile: MessageFile, bucket: string): MessageFile {
    return {
      ...messageFile,
      url: this.fileService.composeFileUrl(messageFile.url, bucket),
      optimizedUrl: this.fileService.composeFileUrl(messageFile.optimizedUrl, bucket),
    } as MessageFile;
  }

  mapUploadedFileToMessageFile(outputDto: UploadFileOutputDto | UploadVideoOutputDto | UploadImageOutputDto, messageFilesInputDto: MessageFilesInputDto, messageId: number) {
    const { fileName, description, type, entityType } = messageFilesInputDto ?? {};
    const { filePath } = outputDto ?? {};
    const { optimisedFilePath } = (outputDto as UploadVideoOutputDto) ?? {};

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
