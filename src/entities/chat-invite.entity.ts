import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChatInviteSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  fromChatParticipantId: z.number(),
  targetUserId: z.number(),
  expirationDate: z.date(),
  token: z.string(),
});

export class ChatInvite extends createZodDto(ChatInviteSchema) {}
