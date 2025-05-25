import { Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/entities/user.entity';


@Controller('auth')
export class AuthController {
  @Post('authentificate')
  Authentification(): User {
    return 'auth';
  }
}