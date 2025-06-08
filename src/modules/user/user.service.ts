import { Injectable } from '@nestjs/common';

import * as randomstring from 'randomstring';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


import { DatabaseService } from 'src/core';
import { User } from 'src/entities/user.entity';
import { CreateUserDtoInput, GenerateJwtTokenInput } from './dtos';
import { UserChatStatus } from '@circle-vibe/shared';

// TODO: move to env
export const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET ?? 'JWT_TOKEN_SECRET'

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async matchUserByPersonalToken(privateKey: string): Promise<User | null> {
    const user = await this.databaseService.user.findFirstOrThrow({
      where: {
        privateKey,
      },
    });

    return (user as User) ?? null;
  }

  async matchUserByPersonalKey(privateKey: string): Promise<User | null> {
    const user = await this.databaseService.user.findFirstOrThrow({
      where: {
        privateKey,
      },
    });

    return (user as User) ?? null;
  }

  async changeUserChatStatus(userId: number, chatStatus: UserChatStatus): Promise<User> {
    const user = await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        chatStatus: chatStatus ?? UserChatStatus.OFFLINE
      },
    })

    return user as User;
  }

  encryptPassword(password: string): string {
    const bcryptSalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, bcryptSalt);
  }

  decryptPassword(password: string): string {
    const bcryptSalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, bcryptSalt);
  }

  comparePasswords(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  async createUser(user: CreateUserDtoInput): Promise<User> {
    const createdUser = await this.databaseService.user.create({
      data: this.#generateNewUserPayload(user),
    });

    return createdUser as User;
  }


  async matchUserByEmail(email: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({ where: { email } });

    return (user as User) ?? null;
  }

    async checkExistence(user: {
      email?: string;
      primaryPhone?: string;
    }): Promise<boolean> {
    const userWithTheSameEmail = !!user?.email?.length
      ? await this.databaseService.user.findFirst({
        where:{
          email: user.email,
        }})
      : null;

    const userWithTheSamePrimaryPhone = !!user?.primaryPhone
      ? await this.databaseService.user.findFirst({
          where: {
            primaryPhone: user?.primaryPhone,
          }
        })
      : null;

    return (
      Boolean(userWithTheSameEmail?.id) ||
      Boolean(userWithTheSamePrimaryPhone?.id)
    );
  }

  generatePrivateKey(payload: Record<string, unknown>): string {
  const secret = randomstring.generate({
    length: 20,
    readable: true,
    charset: "numeric",
  });

  return jwt.sign(payload, secret);
}

#generateNewUserPayload = (user: CreateUserDtoInput): Omit<User, 'id'> => {
  const tokenPayload = {
    username: user.username,
    surname: user.surname,
    email: user.email,
  };
  const privateKey = this.generatePrivateKey(tokenPayload);
  const privateToken = this.generateRandomToken(tokenPayload);
  const { passwordConfirmation, ...userWithoutPassword } = user;

  return {
    ...userWithoutPassword,
    privateKey,
    privateToken,
  } as Omit<User, 'id'>;
}

generateRandomToken(payload: Record<string, unknown>): string {
  const secret = randomstring.generate({
    length: 20,
    readable: false,
  });

  return jwt.sign(
    payload,
    secret
  );
}

generateJwtToken = ({
  id, email, secret
}: GenerateJwtTokenInput) : string => {
  return jwt.sign(
    { _id: id, email },
    secret ?? JWT_TOKEN_SECRET,
    {
      expiresIn: "1d"
    }
  )
}
}
