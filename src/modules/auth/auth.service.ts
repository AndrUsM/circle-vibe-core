import { Injectable } from '@nestjs/common';
import jwt, { JwtPayload, sign } from 'jsonwebtoken';

import { isTokenExpired, UserType } from '@circle-vibe/shared';

import { HashedTokenParams, ParsedJWT } from './types';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  generateJWT = (user: User) => {
    const { id: userId, privateToken, type } = user;
    const isPrivate = type === UserType.PRIVATE;
    const payload = {
      userId,
    } as HashedTokenParams;

    return sign(payload, privateToken, {
      expiresIn: isPrivate ? '4h' : '12h',
    });
  };

  parseJWT = (token: string, personalToken: string): ParsedJWT => {
    const payload = jwt.verify(token, personalToken) as JwtPayload;
    const isExpired =
      Boolean(payload?.exp) && isTokenExpired(Number(payload?.exp));

    return {
      isExpired,
      userId: payload?.userId ?? null,
      isValid: Boolean(payload?.userId) && !isExpired,
    };
  };
}
