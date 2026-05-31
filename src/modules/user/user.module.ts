import { Module } from '@nestjs/common';
import { UserService, UserAuthService } from './service';
import { UserController } from './user.controller';
import { AuthService } from '../auth';
import { FileService } from 'src/core/services';
import { UserRepository } from './user.repository';

@Module({
  providers: [UserService, UserAuthService, UserRepository, AuthService, FileService],
  controllers: [UserController],
})
export class UsersModule {}
