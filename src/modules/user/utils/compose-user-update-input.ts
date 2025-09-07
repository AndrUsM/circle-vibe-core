import { CountryCode } from "@circle-vibe/shared";

import { Prisma, User } from "@prisma/client";

export const composeUserUpdateInput = (user: User): Prisma.UserUpdateInput => {
  return {
    username: user.username ,
    firstname: user.firstname,
    surname: user.surname,
    birthDate: user.birthDate,
    isAllowedToSearch: user.isAllowedToSearch,
    isHiddenContactInfo: user.isHiddenContactInfo,
    city: user.city,
    country: user.country as CountryCode,
    email: user.email,
    primaryPhone: user.primaryPhone,
    blockedUserIds: user.blockedUserIds,
  };
};