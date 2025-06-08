import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { UserRole } from '@circle-vibe/shared';
import { UserSchema } from './user.entity';
import { ChatSchema } from './chat.entity';

export const ChatParticipantSchema = z.object({
  id: z.number(),
  userId: z.number(),
  user: UserSchema,
  chatId: z.number(),
  chat: ChatSchema,
  chatRole: z.nativeEnum(UserRole).default(UserRole.ADMIN),
});

export class ChatParticipant extends createZodDto(ChatParticipantSchema) {}
