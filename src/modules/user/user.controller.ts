import { BadRequestException, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  @HttpCode(201)
  async uploadAvatar(@Param('id') userId: number, file: File) {
    const isUseExist = await this.userService.getById(userId);

    if (!isUseExist) {
      return new BadRequestException();
    }

    await this.userService.uploadAvatar(userId, file);
    const user = await this.userService.getById(userId);

    return user;
  }
}
