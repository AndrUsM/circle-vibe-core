import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { UserType, UserRole } from '@circle-vibe/shared';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  surname: z.string(),
  birthDate: z.date().optional(),
  password: z.string(),
  avatarUrl: z.string().optional(),
  isHiddenContactInfo: z.boolean().default(true),
  country: z.string().optional(),
  city: z.string().optional(),
  email: z.string().email(),
  privateKey: z.string(),
  privateToken: z.string(),
  primaryPhone: z.string().optional(),
  type: z.nativeEnum(UserType),
  role: z.nativeEnum(UserRole),
});

export class User extends createZodDto(UserSchema) {}
