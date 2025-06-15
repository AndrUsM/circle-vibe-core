import { BadRequestException, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth';

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
      return new BadRequestException();
    }

    await this.userService.uploadAvatar(userId, file);

    return this.userService.getById(userId);
  }

  @Get('by-token/:token')
  @HttpCode(200)
  async getUserByToken(@Param('token') token: string) {
    if (!token) {
      return new BadRequestException();
    }

    const payload = this.authService.decodeJWT(token);
    const userId = payload?.userId;

    if (!userId) {
      return new BadRequestException();
    }

    return this.userService.getById(Number(userId));
  }
}
