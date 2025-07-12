import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { FileService } from 'src/core/services';
import { ChatService } from '../chat';
import { ParticipantService } from '../participant/participant.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, FileService, ChatService, ParticipantService],
  exports: [AuthService]
})
export class AuthModule {}
