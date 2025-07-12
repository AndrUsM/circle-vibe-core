import { ChatType } from "@circle-vibe/shared";

export interface ChatListParams {
  cursor: number;
  limit: number;
  userId?: number;
  readableName?: string;
  type?: ChatType;
  isGroupChat?: boolean;
  updatedAt?: Date;
  empty?: boolean;
  name?: string;
  hidden?: boolean;
  removed?: boolean;
}