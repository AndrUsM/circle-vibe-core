import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { FileService } from 'src/core/services';
import { ChatService } from '../chat';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, FileService, ChatService],
  exports: [AuthService]
})
export class AuthModule {}
