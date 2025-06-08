import { UserRole, UserType } from "@circle-vibe/shared";

export interface CreateUserDtoInput {
  username: string;
  surname: string;
  birthDate: Date;
  password: string;
  passwordConfirmation: string;
  isHiddenContactInfo: boolean;
  city: string;
  country: string;
  email: string;
  primaryPhone?: string;
  type: UserType;
  role: UserRole;
}
