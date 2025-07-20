import { InviteTokenInputDto } from './invite-token.input';

export interface InviteTokenOutputDto {
  isExpired: boolean;
  isValid: boolean;
  data?: InviteTokenInputDto;
}
