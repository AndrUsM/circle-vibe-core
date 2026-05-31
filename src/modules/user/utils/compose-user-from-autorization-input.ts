import { User } from '@prisma/client';
import { CreateUserDtoInput } from '../dtos';
import { AccountStatus } from '@circle-vibe/shared';

type UserDto = Omit<User, 'id' | 'privateKey' | 'privateToken' | 'createdAt' | 'updatedAt' | 'chatStatus' | 'avatarUrl' | 'avatarUrlOptimized'>;

export const composeUserFromAuthorizationInput = (input: CreateUserDtoInput): UserDto => {
  return {
    username: input.username,
    firstname: input.firstname,
    surname: input.surname,
    birthDate: input.birthDate,
    password: input.password,
    isAllowedToSearch: input.isAllowedToSearch,
    isHiddenContactInfo: input.isHiddenContactInfo,
    city: input.city,
    country: input.country,
    email: input.email,
    primaryPhone: input.primaryPhone ?? null,
    type: input.type,
    accountStatus: AccountStatus.ACTIVE,
    blockedUserIds: [],
  };
};
