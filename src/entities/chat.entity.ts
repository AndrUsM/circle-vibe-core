import { ChatType } from "@circle-vibe/shared";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { MessageSchema } from "./message.entity";

export const ChatSchema = z.object({
  id: z.number(),
  avatarUrl: z.string().optional(),
  hidden: z.boolean().default(false),
  isActive: z.boolean().default(true),
  name: z.string(),
  readableName: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ChatType).default(ChatType.PUBLIC),
  isGroupChat: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  hasUnreadMessages: z.boolean().default(false),
  empty: z.boolean().default(true),
  unreadMessagesCount: z.number().default(0),
  usersLimit: z.number(),
  lastMessageId: z.number(),
  lastMessage: MessageSchema.optional(),
  removed: z.boolean().default(false),
})

export class Chat extends createZodDto(ChatSchema) {}