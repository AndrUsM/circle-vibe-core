import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { EmailService, EmailServiceHttpModule, FileService } from 'src/core/services';
import { ChatService } from '../chat';
import { ParticipantService } from '../participant/participant.service';

@Module({
  imports: [EmailServiceHttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    FileService,
    EmailService,
    ChatService,
    ParticipantService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
