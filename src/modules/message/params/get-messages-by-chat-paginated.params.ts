export interface GetMessagesByChatPaginatedParams {
  threadId?: number;
  content?: string;
  senderIds?: number[];
  currentUserId?: number
}