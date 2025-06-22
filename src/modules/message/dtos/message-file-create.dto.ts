import { MessageType } from "@circle-vibe/shared";
import { UploadFileMetaInputDto } from "./upload-file-meta-input.dto";

export interface MessageFileCreateInputDto {
  content: string;
  chatId: number;
  senderId: number;
  threadId?: number;
  hidden: boolean;
  messageType: MessageType;
  fileMeta: UploadFileMetaInputDto;
}