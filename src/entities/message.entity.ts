import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageStatus, MessageType } from "@circle-vibe/shared";
import { ChatParticipantSchema } from "./chat-participant.entity";
import { ThreadParticipantSchema } from "./tread-participant.entity";

export const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  status: z.nativeEnum(MessageStatus).default(MessageStatus.UNREAD),
  chatId: z.number(),
  senderId: z.number(),
  thread: ThreadParticipantSchema.optional(),
  sender: ChatParticipantSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
  threadId: z.number(),
  removed: z.boolean(),
  hidden: z.boolean(),
  isSavedMessages: z.boolean().default(false),
})

export class Message extends createZodDto(MessageSchema) {}
