import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import { EmailService, EmailServiceHttpModule, FileService } from 'src/core/services';
import { ChatService } from '../chat';
import { ParticipantService } from '../participant/participant.service';
import { AuthStartUpService } from './services';

@Module({
  imports: [EmailServiceHttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    FileService,
    EmailService,
    ChatService,
    AuthStartUpService,
    ParticipantService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
