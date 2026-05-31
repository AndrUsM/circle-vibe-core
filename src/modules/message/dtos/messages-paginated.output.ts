export interface MessagePaginatedDto<T> {
  data: T[];
  total: number;
  nextCursor: number | null;
  hasNextPage: boolean;
  limit: number;
}
