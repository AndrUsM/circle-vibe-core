export interface SearchUserForInvitationInputDto {
  chatParticipantId: number;
  chatId: number
  username: string;
  personalTargetUserToken?: string;
}