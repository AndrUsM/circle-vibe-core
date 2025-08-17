import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { UserService } from './user.service';

import { AuthService } from '../auth';
import { UpdateUserDtoInput } from './dtos';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('upload-avatar/:id')
  @HttpCode(201)
  async uploadAvatar(@Param('id') userId: number, file: File) {
    const isUseExist = await this.userService.getById(userId);

    if (!isUseExist) {
      throw new BadRequestException();
    }

    await this.userService.uploadAvatar(userId, file);

    return this.userService.getById(userId);
  }

  @Get('by-token/:token')
  @HttpCode(200)
  async getUserByToken(@Param('token') token: string) {
    if (!token) {
      throw new BadRequestException();
    }

    const payload = this.authService.decodeJWT(token);
    const userId = payload?.userId;

    if (!userId) {
      throw new BadRequestException();
    }

    const user = await this.userService.getById(Number(userId));

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @Put('/:id')
  @HttpCode(200)
  async changeUserChatStatus(
    @Param('id') userId: number,
    @Body() params: UpdateUserDtoInput,
  ) {
    const updatedUser = await this.userService.updateUser(
      Number(userId),
      params,
    );

    if (!updatedUser) {
      throw new BadRequestException();
    }

    return updatedUser;
  }
}
