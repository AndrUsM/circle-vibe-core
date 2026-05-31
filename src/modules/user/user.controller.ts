import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';

import { UserService } from './service/user.service';

import { AuthService } from '../auth';
import { UpdateUserDtoInput } from './dtos';
import { AccountStatus } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('list-related-with-user/:id')
  @HttpCode(200)
  async getUsersToBlock(@Param('id', ParseIntPipe) userId: number) {
    if (!userId) {
      throw new BadRequestException();
    }

    return this.userService.getUsersToBlock(userId);
  }

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

  @Put(':id')
  @HttpCode(200)
  async changeUserChatStatus(@Param('id') userId: number, @Body() params: UpdateUserDtoInput) {
    const updatedUser = await this.userService.updateUser(Number(userId), params);

    if (!updatedUser) {
      throw new BadRequestException();
    }

    return updatedUser;
  }

  @Post(':id/deactivate-account')
  @HttpCode(200)
  async deactivateAccount(@Param('id') userId: number) {
    return this.userService.partiallyUpdate(Number(userId), {
      accountStatus: AccountStatus.DEACTIVATED,
      isHiddenContactInfo: true,
      isAllowedToSearch: false,
    });
  }

  @Post(':id/activate-account')
  @HttpCode(200)
  async activateAccount(@Param('id') userId: number) {
    return this.userService.partiallyUpdate(Number(userId), {
      accountStatus: AccountStatus.ACTIVE,
      isHiddenContactInfo: false,
      isAllowedToSearch: true,
    });
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteAccount(@Param('id') userId: number) {
    const deletedUser = await this.userService.deleteUser(userId);

    if (!deletedUser) {
      throw new BadRequestException();
    }

    return deletedUser;
  }
}
