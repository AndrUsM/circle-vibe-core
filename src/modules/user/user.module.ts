import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth';
import { FileService } from 'src/core/services';

@Module({
  providers: [UserService, AuthService, FileService],
  controllers: [UserController],
})
export class UsersModule {}
