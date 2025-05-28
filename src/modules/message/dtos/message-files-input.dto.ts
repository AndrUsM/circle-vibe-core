import { MessageFile } from "@circle-vibe/shared";

export type MessageFilesInputDto = Omit<MessageFile, 'id' | 'messageId'>;