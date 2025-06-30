import { UserChatRole } from "@circle-vibe/shared";

export interface InviteTokenInputDto {
  chatId: number,
  targetUserId: number,
  role: UserChatRole
  fromChatParticipantId: number;
}
