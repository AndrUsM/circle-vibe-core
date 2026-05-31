import { UserChatRole } from '@prisma/client';

export interface CreateChatInviteInputDto {
  chatId: number;
  targetUserId: number;
  role: UserChatRole;
  fromChatParticipantId: number;
  token: string;
  expirationDate: Date;
}
