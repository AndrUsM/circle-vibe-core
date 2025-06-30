import { InviteTokenInputDto } from './invite-token-input.dto';

export interface InviteTokenOutputDto {
  isExpired: boolean;
  isValid: boolean;
  data?: InviteTokenInputDto;
}
