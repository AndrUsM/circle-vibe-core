import { UserChatRole } from '@prisma/client';

export interface CreateChatParticipantInput {
  chatRole: UserChatRole;
  userId: number;
  chatId: number;
}
