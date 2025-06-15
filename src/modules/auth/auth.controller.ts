import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

import { UserType, UserRole, ChatType } from '@circle-vibe/shared';

import { UserService } from '../user/user.service';
import { AuthentificationInput } from './dtos';
import { AuthorizationInput } from './dtos/authorization.input';
import { AuthService } from './auth.service';
import { comparePasswords, composeUserFromAuthorizationInput } from './utils';
import { ChatService } from '../chat';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  @Post('start-up')
  @HttpCode(200)
  async startUp() {
    await this.chatService.create({
      name: 'Saved Messages',
      hidden: true,
      description: 'description',
      type: ChatType.PRIVATE,
      usersLimit: 1,
    });
  }

  @Post('sign-in')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully authenticated',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    type: AuthentificationInput,
    description: 'Request body',
  })
  @HttpCode(200)
  /**
   * Authenticate a user using the private key
   * @param params The params of the authentification
   * @returns The user if found, otherwise throw a NotFoundException
   */
  async authentificate(@Body() params: AuthentificationInput) {
    if (!params || !Object.values(params).length) {
      return new BadRequestException();
    }

    const user = await this.userService.matchUserByEmail(
      params.email,
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
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    type: AuthentificationInput,
    description: 'Request body',
  })
  /**
   * Authorize a user to access the application
   * @param params The params of the authorization
   * @returns The user if created, otherwise throw a BadRequestException
   */
  async authorization(@Body() params: AuthorizationInput) {
    if (!params || !Object.values(params).length) {
      return new BadRequestException();
    }

    const isUserWithTheSameEmailExists =
      await this.userService.matchUserByEmail(params?.email);
    const isUserWIthTheSamePhoneExists =
      await this.userService.checkExistence(params);

    if (isUserWithTheSameEmailExists?.id || isUserWIthTheSamePhoneExists) {
      return new BadRequestException('User already exists');
    }

    if (!comparePasswords(params)) {
      return new BadRequestException('Passwords do not match');
    }

    const encryptedPassword = this.userService.encryptPassword(params.password);
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
