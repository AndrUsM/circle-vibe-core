import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { UserType, ChatType } from '@circle-vibe/shared';

import { UserService } from '../user/user.service';
import {
  AuthentificationInput,
  AuthorizationInput,
  RefreshTokenInputDto,
  RestorePasswordInputDto,
} from './dtos';
import { AuthService } from './auth.service';
import { comparePasswords } from './utils';
import { JwtAuthGuard } from 'src/guards';
import { HashedTokenParams } from './types';
import { AuthStartUpService } from './services';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private authStartUpService: AuthStartUpService,
  ) {}

  @ApiOperation({ summary: 'Starts the auth setup process for a user' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Setup complete' })
  @Post(':userId/start-up')
  @HttpCode(200)
  async startUp(@Param('userId', ParseIntPipe) userId: number) {
    const isUserExists = await this.userService.getById(userId);

    if (!userId || !isUserExists) {
      throw new BadRequestException('User does not exist');
    }

    return this.authStartUpService.createDefaultPrivateSettings(userId);
  }

  @Get('current')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() request: Request & HashedTokenParams) {
    if (!request?.userId) {
      throw new BadRequestException();
    }

    const user = await this.userService.getById(Number(request?.userId));

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() params: RefreshTokenInputDto) {
    const tokenInfo = this.authService.decodeJWT(params?.token);

    if (!tokenInfo?.userId) {
      throw new BadRequestException();
    }

    const { userId } = tokenInfo;

    const user = await this.userService.getById(Number(userId));

    if (!user) {
      throw new BadRequestException();
    }

    return {
      token: this.authService.generateJWT(user),
    };
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
      throw new BadRequestException();
    }

    const user = await this.userService.matchUserByEmail(params.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordsMatch = this.userService.comparePasswords(
      params.password,
      user.password,
    );

    if (!isPasswordsMatch) {
      throw new BadRequestException('User not found');
    }

    const token = this.authService.generateJWT(user);

    return { token, user };
  }

  @Put('restore-password')
  @HttpCode(200)
  async restorePassword(@Body() params: RestorePasswordInputDto) {
    if (!params || !Object.values(params).length) {
      throw new BadRequestException();
    }

    const user = await this.userService.matchUserByEmail(params.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.updateUser(user.id, {
      password: params.password,
    });
    const token = this.authService.generateJWT(user);

    return {
      token,
      user,
    };
  }

  @Post('sign-up')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    type: AuthorizationInput,
    description: 'Request body',
  })
  /**
   * Authorize a user to access the application
   * @param params The params of the authorization
   * @returns The user if created, otherwise throw a BadRequestException
   */
  async authorization(@Body() params: AuthorizationInput) {
    if (!params || !Object.values(params).length) {
      throw new BadRequestException();
    }

    const isUserWithTheSameEmailExists =
      await this.userService.matchUserByEmail(params?.email);
    const isUserWIthTheSamePhoneExists =
      await this.userService.checkExistence(params);

    if (isUserWithTheSameEmailExists?.id || isUserWIthTheSamePhoneExists) {
      throw new BadRequestException('User already exists');
    }

    if (!comparePasswords(params)) {
      throw new NotFoundException('Passwords do not match');
    }

    const encryptedPassword = this.userService.encryptPassword(params.password);
    const createdUser = await this.userService.createUser({
      ...params,
      type: params.type,
      password: encryptedPassword,
    });

    await this.startUp(createdUser?.id);

    if (createdUser?.id) {
      return createdUser;
    } else {
      throw new BadRequestException('User not created');
    }
  }
}
