import { Injectable } from '@nestjs/common';
import { JwtPayload, sign } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

import { isTokenExpired, UserType } from '@circle-vibe/shared';

import { User } from 'src/entities/user.entity';
import { HashedTokenParams, ParsedJWT } from './types';

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

  parseJWT = (
    token: string,
    personalToken: string,
    place?: string,
  ): ParsedJWT => {
    try {
      const payload = jwt.verify(token, personalToken) as JwtPayload;
      const isExpired =
        Boolean(payload?.exp) && isTokenExpired(Number(payload?.exp));

      return {
        isExpired,
        userId: payload?.userId ?? null,
        isValid: Boolean(payload?.userId) && !isExpired,
      };
    } catch (error) {
      return {
        isExpired: true,
        userId: null,
        isValid: false,
      }
    }
  };

  decodeJWT = (token: string): ParsedJWT => {
    const payload = jwt.decode(token) as JwtPayload;

    return {
      isExpired: false,
      userId: payload?.userId ?? null,
      isValid: true,
    };
  };
}
