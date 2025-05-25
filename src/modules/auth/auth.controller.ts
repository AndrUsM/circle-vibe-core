import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthentificationInput } from './dtos';
import { AuthorizationInput } from './dtos/authorization.input';
import { AuthService } from './auth.service';
import { User } from 'src/database/generated/prisma';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService, private authService: AuthService) {}

  @Post('authentificate')
  @HttpCode(200)
  /**
   * Authenticate a user using the private key
   * @param params The params of the authentification
   * @returns The user if found, otherwise throw a NotFoundException
   */
  async authentificate(
    @Body() params: AuthentificationInput,
  ) {
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

  @Post('authorization')
  @HttpCode(201)
  async authorization(
    @Body() params: AuthorizationInput,
    @Res() res: Response
  ) {
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
      password: encryptedPassword,
    });

    if (createdUser?.id) {
      return createdUser;
    } else {
      return new BadRequestException('User not created');
    }
  }

}
