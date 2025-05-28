import { MessageFile, MessageStatus, MessageType } from "@circle-vibe/shared";

export interface MessageCreateInputDto {
  content: string;
  chatId: number;
  senderId: number;
  threadId?: number;
  hidden: boolean;
  messageType: MessageType;
  files: MessageFile[];
}