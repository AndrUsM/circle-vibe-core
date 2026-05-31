import { MessageType } from '@prisma/client';
import { MessageFilesInputDto } from './message-files.input';

export interface MessageCreateInputDto {
  content: string;
  chatId: number;
  senderId: number;
  threadId?: number;
  hidden: boolean;
  messageType: MessageType;
  files: MessageFilesInputDto[];
}
