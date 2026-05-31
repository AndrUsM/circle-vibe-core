import { UserChatRole } from '@prisma/client';

export interface UpdateChatParticipantInput {
  chatRole?: UserChatRole;
  isMuted?: boolean;
}
