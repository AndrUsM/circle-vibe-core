import { CountryCode, UserType } from '@circle-vibe/shared';
import { AccountStatus } from '@prisma/client';

export interface UpdateUserDtoInput {
  avatarUrl?: string;
  avatarUrlOptimized?: string;
  blockedUserIds?: number[];
  username?: string;
  firstname?: string;
  surname?: string;
  birthDate?: Date;
  password?: string;
  isHiddenContactInfo?: boolean;
  isAllowedToSearch?: boolean;
  accountStatus?: AccountStatus;
  city?: string;
  country?: CountryCode;
  email?: string;
  primaryPhone?: string;
  type?: UserType;
  role?: string;
}
