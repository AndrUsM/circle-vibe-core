import { Injectable } from '@nestjs/common';
import { ChatParticipant } from '@prisma/client';
import { User, UserChatStatus } from '@circle-vibe/shared';

import { DatabaseService } from '../../core';
import { FileService } from '../../core/services';
import { UpdateUserDtoInput } from './dtos';
import { composeUserUpdateInput } from './utils';
import { UserAuthService } from './service/user-auth.service';

@Injectable()
export class UserRepository {
  constructor(
    private databaseService: DatabaseService,
    private fileService: FileService,
    private userAuthService: UserAuthService,
  ) {}

  async getById(userId: number): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user as User;
  }

  async partiallyUpdate(id: number, updateUserInputDto: Partial<UpdateUserDtoInput>) {
    const user = await this.databaseService.user.findFirst({
      where: { id },
    });

    const updatedUser = await this.databaseService.user.update({
      where: { id },
      data: {
        ...user,
        ...updateUserInputDto,
      },
    });

    return updatedUser as User;
  }

  async updateUser(id: number, updateUserInputDto: UpdateUserDtoInput): Promise<User | null> {
    const user = (await this.databaseService.user.findUnique({
      where: {
        id,
      },
    })) as User | null;

    if (!user) {
      return null;
    }

    const password = updateUserInputDto?.password?.length ? this.userAuthService.encryptPassword(updateUserInputDto.password) : null;

    const updatedPassword = password ? { password } : {};
    const avatarUrl = updateUserInputDto?.avatarUrl?.length ? { avatarUrl: updateUserInputDto.avatarUrl } : null;
    const optimizedAvatarUrl = updateUserInputDto?.avatarUrlOptimized?.length ? { avatarUrlOptimized: updateUserInputDto.avatarUrlOptimized } : null;

    const updatedUser = await this.databaseService.user.update({
      where: {
        id,
      },
      data: {
        ...composeUserUpdateInput(user),
        ...updateUserInputDto,
        ...updatedPassword,
        ...avatarUrl,
        ...optimizedAvatarUrl,
      },
    });

    return updatedUser as User;
  }

  async matchUserByPersonalToken(privateKey: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        privateKey,
      },
    });

    return (user as User) ?? null;
  }

  async getUsersToBlock(userId: number): Promise<ChatParticipant[]> {
    return this.databaseService.chatParticipant.findMany({
      distinct: ['userId'],
      where: {
        NOT: {
          userId,
        },

        chat: {
          participants: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findUserByPredicate(predicate: Partial<User>): Promise<User | null> {
    return this.databaseService.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: predicate as any,
    }) as Promise<User | null>;
  }

  async checkExistence(user: { email?: string; primaryPhone?: string }): Promise<boolean> {
    const userWithTheSameCredentials =
      !!user?.primaryPhone || user?.email
        ? await this.databaseService.user.findFirst({
            where: {
              OR: [{ primaryPhone: user?.primaryPhone }, { email: user.email }],
            },
          })
        : null;

    return Boolean(userWithTheSameCredentials?.id);
  }

  async setUserChatStatus(userId: number, chatStatus: UserChatStatus): Promise<User> {
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

  async createUser(data: Omit<User, 'id'>): Promise<User | null> {
    const createdUser = await this.databaseService.user.create({
      data,
    });

    return createdUser as User;
  }

  async uploadAvatarCore(userId: number, avatar: File): Promise<void> {
    const file = await this.fileService.uploadImage(avatar);
    const userUpdateDto = {
      avatarUrl: file?.filePath,
      avatarUrlOptimized: file?.optimisedFilePath,
    };

    await this.partiallyUpdate(userId, userUpdateDto);
  }

  async permanentlyRemoveUser(userId: number): Promise<void> {
    await this.databaseService.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async softDeleteUserData(userId: number): Promise<void> {
    await this.databaseService.$transaction([
      this.databaseService.message.updateMany({
        where: {
          sender: {
            userId,
          },
        },
        data: {
          removed: true,
        },
      }),

      this.databaseService.messageFile.deleteMany({
        where: {
          message: {
            sender: {
              userId,
            },
          },
        },
      }),

      this.databaseService.chatParticipant.deleteMany({
        where: {
          userId,
        },
      }),
    ]);
  }
}
