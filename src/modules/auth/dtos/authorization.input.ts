import { UserRole, UserType } from "@prisma/client";

export interface AuthorizationInput {
  username: string;
  surname: string;
  birthDate: Date;
  password: string;
  passwordConfirmation: string;
  avatar: string;
  isHiddenContactInfo: boolean;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  phones: string[];
  email: string;
  primaryPhone: string;
  type: UserType;
  secret: boolean;
  role: UserRole;
}
