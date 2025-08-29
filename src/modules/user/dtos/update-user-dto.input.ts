import { CountryCode, UserType } from "@circle-vibe/shared";

export interface UpdateUserDtoInput {
  avatarUrl?: string;
  avatarUrlOptimized?: string;
  username?: string;
  firstname?: string;
  surname?: string;
  birthDate?: Date;
  password?: string;
  isHiddenContactInfo?: boolean;
  isAllowedToSearch?: boolean;
  city?: string;
  country?: CountryCode;
  email?: string;
  primaryPhone?: string;
  type?: UserType;
  role?: string;
}
