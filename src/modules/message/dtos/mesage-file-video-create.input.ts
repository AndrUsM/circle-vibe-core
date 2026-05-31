import { MessageFileEntityType, MessageFileType, MessageType } from '@prisma/client';

export interface VideoFileMetaInputDto {
  fileName: string;
  url: string;
  optimizedUrl: string;
  type: MessageFileType;
  description: string | null;
  entityType: MessageFileEntityType;
  messageId: number;
}

export interface MessageFileVideoCreateDto {
  content: string;
  chatId: number;
  senderId: number;
  threadId?: number;
  hidden: boolean;
  messageType: MessageType;
  fileUrl: string;
  optimizedUrl: string;
  fileMeta: VideoFileMetaInputDto;
}
