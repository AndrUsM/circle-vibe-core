export interface GetChatParticipantInput {
  userId: number;
  chatId: number;

  // make it required after implementing pagination
  page?: number;
  pageSize?: number;
}