import { UserRole, UserType } from "@circle-vibe/shared";

export interface CreateUserDtoInput {
  username: string;
  firstname: string;
  surname: string;
  birthDate: Date;
  password: string;
  avatarUrl?: string;
  passwordConfirmation: string;
  isHiddenContactInfo: boolean;
  isAllowedToSearch: boolean;
  city: string;
  country: string;
  email: string;
  primaryPhone?: string;
  type: UserType;
  role: UserRole;
}
