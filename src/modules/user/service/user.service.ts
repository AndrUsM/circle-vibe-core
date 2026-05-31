import { Injectable } from '@nestjs/common';

import { CreateUserDtoInput, UpdateUserDtoInput } from '../dtos';
import { User, UserChatStatus } from '@circle-vibe/shared';
import { composeUserFromAuthorizationInput } from '../utils';
import { UserRepository } from '../user.repository';
import { UserAuthService } from './user-auth.service';

@Injectable()
export class UserService {
  constructor(
    private userAuthService: UserAuthService,
    private userRepository: UserRepository,
  ) {}

  async partiallyUpdate(id: number, updateUserInputDto: Partial<UpdateUserDtoInput>) {
    return this.userRepository.partiallyUpdate(id, updateUserInputDto);
  }

  async updateUser(id: number, updateUserInputDto: UpdateUserDtoInput): Promise<User | null> {
    return this.userRepository.updateUser(id, updateUserInputDto);
  }

  async getById(userId: number): Promise<User | null> {
    return this.userRepository.getById(userId);
  }

  async createUser(user: CreateUserDtoInput): Promise<User> {
    const inputDto = this.#generateNewUserPayload(user);
    const createdUser = await this.userRepository.createUser(inputDto);

    return createdUser as User;
  }

  async checkExistence(user: { email?: string; primaryPhone?: string }): Promise<boolean> {
    return this.userRepository.checkExistence(user);
  }

  async getUsersToBlock(userId: number) {
    return this.userRepository.getUsersToBlock(userId);
  }

  async changeUserChatStatus(userId: number, chatStatus: UserChatStatus) {
    return this.userRepository.setUserChatStatus(userId, chatStatus);
  }

  async deleteUser(userId: number): Promise<User | null> {
    const user = await this.userRepository.findUserByPredicate({
      id: userId,
    });

    if (!user) {
      return null;
    }

    await this.userRepository.permanentlyRemoveUser(userId);
    await this.userRepository.softDeleteUserData(userId);

    return user;
  }

  async uploadAvatar(userId: number, avatar: File): Promise<void> {
    await this.userRepository.uploadAvatarCore(userId, avatar);
  }

  async matchUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByPredicate({ email });
  }

  #generateNewUserPayload = (user: CreateUserDtoInput): Omit<User, 'id'> => {
    const tokenPayload = {
      username: user.username,
      surname: user.surname,
      email: user.email,
    };
    const privateKey = this.userAuthService.generatePrivateKey(tokenPayload);
    const privateToken = this.userAuthService.generateRandomToken(tokenPayload);

    return {
      ...composeUserFromAuthorizationInput(user),
      privateKey,
      privateToken,
    } as Omit<User, 'id'>;
  };
}
