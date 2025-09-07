import { Injectable } from '@nestjs/common';

import * as randomstring from 'randomstring';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { DatabaseService } from 'src/core';
import { CreateUserDtoInput, GenerateJwtTokenInput, UpdateUserDtoInput } from './dtos';
import { User, UserChatStatus } from '@circle-vibe/shared';
import { composeUserFromAuthorizationInput, composeUserUpdateInput } from './utils';
import { FileService } from 'src/core/services';
import { JWT_TOKEN_SECRET } from 'src/configuration';
import { ChatParticipant, Prisma, UserRole } from '@prisma/client';


@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService, private fileService: FileService) {}

  async matchUserByPersonalToken(privateKey: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        privateKey,
      },
    });

    return (user as User) ?? null;
  }

  async updateUser(id: number, updateUserInputDto: UpdateUserDtoInput): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id
      },
    }) as User | null;

    if (!user) {
      return null;
    }

    const password = updateUserInputDto?.password?.length ? this.encryptPassword(updateUserInputDto.password) : null;
    const updatedPassword = password ? { password } : {};
    const avatarUrl = updateUserInputDto?.avatarUrl?.length ? { avatarUrl: updateUserInputDto.avatarUrl } : null;
    const optimizedAvatarUrl = updateUserInputDto?.avatarUrlOptimized?.length ? { avatarUrlOptimized: updateUserInputDto.avatarUrlOptimized } : null;

    const updatedUser = await this.databaseService.user.update({
      where: {
        id
      },
      data: {
        ...composeUserUpdateInput(user),
        ...updateUserInputDto,
        ...updatedPassword,
        ...avatarUrl,
        ...optimizedAvatarUrl,
        role: updateUserInputDto?.role as UserRole ?? user.role
      }
    });

    return updatedUser as User;
  }

  async matchUserByPersonalKey(privateKey: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        privateKey,
      },
    });

    return (user as User) ?? null;
  }

  async changeUserChatStatus(
    userId: number,
    chatStatus: UserChatStatus,
  ): Promise<User> {
    const user = await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        chatStatus: chatStatus ?? UserChatStatus.OFFLINE,
      },
    });

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

  async deleteUser(userId: number): Promise<void> {
    await this.databaseService.user.delete({
      where: {
        id: userId,
      },
    });

    const participants = await this.databaseService.chatParticipant.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      }
    });
    const participantIds = participants.map((participant) => participant.id);
    const messageIds = await this.databaseService.message.findMany({
      where: {
        senderId: {
          in: participantIds
        },
      },
      select: {
        id: true,
      }
    })

    await this.databaseService.chatParticipant.deleteMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    await this.databaseService.message.updateMany({
      where: {
        senderId: {
          in: participantIds
        },
      },
      data: {
        removed: true,
      }
    });

    await this.databaseService.messageFile.deleteMany({
      where: {
        messageId: {
          in: messageIds.length ? messageIds?.map(({ id }) => id) : [],
        },
      },
    });
  }

  async matchUserByEmail(email: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    return (user as User) ?? null;
  }

  async checkExistence(user: {
    email?: string;
    primaryPhone?: string;
  }): Promise<boolean> {
    const userWithTheSameEmail = !!user?.email?.length
      ? await this.databaseService.user.findUnique({
          where: {
            email: user.email,
          },
        })
      : null;

    const userWithTheSamePrimaryPhone = !!user?.primaryPhone
      ? await this.databaseService.user.findFirst({
          where: {
            primaryPhone: user?.primaryPhone,
          },
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
      charset: 'numeric',
    });

    return jwt.sign(payload, secret);
  }

  async getUsersToBlock(userId: number): Promise<ChatParticipant[]> {
    const chatIdsRequest = await this.databaseService.chatParticipant.findMany({
      distinct: ['chatId'],
      select: {
        chatId: true
      },
      where: {
        userId
      }
    });
    const chatIds = chatIdsRequest.map(({ chatId }) => chatId);

    return this.databaseService.chatParticipant.findMany({
      distinct: ['userId'],
      where: {
        chatId: {
          in: chatIds
        },
      },
      include: {
        user: true,
      }
    })
  }

  #generateNewUserPayload = (user: CreateUserDtoInput): Omit<User, 'id'> => {
    const tokenPayload = {
      username: user.username,
      surname: user.surname,
      email: user.email,
    };
    const privateKey = this.generatePrivateKey(tokenPayload);
    const privateToken = this.generateRandomToken(tokenPayload);

    return {
      ...composeUserFromAuthorizationInput(user),
      privateKey,
      privateToken,
    } as Omit<User, 'id'>;
  };

  generateRandomToken(payload: Record<string, unknown>): string {
    const secret = randomstring.generate({
      length: 20,
      readable: false,
    });

    return jwt.sign(payload, secret);
  }

  generateJwtToken = ({ id, email, secret }: GenerateJwtTokenInput): string => {
    return jwt.sign({ _id: id, email }, secret ?? JWT_TOKEN_SECRET, {
      expiresIn: '1d',
    });
  };

  async uploadAvatar(userId: number, avatar: File): Promise<void> {
    const file = await this.fileService.uploadImage(avatar);

    this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl: file?.filePath,
        avatarUrlOptimized: file?.optimisedFilePath,
      }
    });
  }

  async getById(userId: number): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user as User;
  }
}
