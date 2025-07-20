import { MessageFile } from "@prisma/client";

export type UploadFileMetaInputDto = Omit<
  MessageFile,
  'id' | 'messageId | url'
> & {
  fileType: string;
};
