import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';

import { UserType, UserRole } from '@circle-vibe/shared';

import { UserService } from '../user/user.service';
import { AuthentificationInput } from './dtos';
import { AuthorizationInput } from './dtos/authorization.input';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService, private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  /**
   * Authenticate a user using the private key
   * @param params The params of the authentification
   * @returns The user if found, otherwise throw a NotFoundException
   */
  async authentificate(
    @Body() params: AuthentificationInput,
  ) {
    if (!params) {
      return new BadRequestException();
    }

    const user = await this.userService.matchUserByPersonalKey(
      params.identificationKey,
    );

    if (!user) {
      return new NotFoundException('User not found');
    }

    const isPasswordsMatch = this.userService.comparePasswords(
      params.password,
      user.password,
    );

    if (!isPasswordsMatch) {
      return new BadRequestException('User not found');
    }

    const token = this.authService.generateJWT(user);

    return { token, user };
  }

  @Post('sign-up')
  @HttpCode(201)
  async authorization(
    @Body() params: AuthorizationInput,
  ) {
    if (!params) {
      return new BadRequestException();
    }

    const isUserWithTheSameEmailExists =
      await this.userService.matchUserByEmail(params?.email);
    const isUserWIthTheSamePhoneExists =
      await this.userService.checkExistence(params);

      if (isUserWithTheSameEmailExists?.id) {
      return new NotFoundException('User not found');
    }

    if (isUserWIthTheSamePhoneExists) {
      return new BadRequestException('User already exists');
    }

    const encryptedPassword = this.userService.encryptPassword(
      params.password
    );

    const createdUser = await this.userService.createUser({
      ...params,
      type: params.type as UserType,
      role: params.role as UserRole,
      password: encryptedPassword,
    });

    if (createdUser?.id) {
      return createdUser;
    } else {
      return new BadRequestException('User not created');
    }
  }

}
