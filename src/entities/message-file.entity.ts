import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageFileEntityType, MessageFileType } from "@circle-vibe/shared";

export const MessageFileSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  url: z.string(),
  type: z.nativeEnum(MessageFileType),
  description: z.string().optional(),
  entityType: z.nativeEnum(MessageFileEntityType).default(MessageFileEntityType.FILE),
  messageId: z.number(),
})

export class MessageFile extends createZodDto(MessageFileSchema) {}
