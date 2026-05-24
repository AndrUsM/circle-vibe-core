import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user';
import {
  EmailService,
  EmailServiceHttpModule,
  FileService,
} from 'src/core/services';
import { AuthStartUpService } from './services';

import { ChatService } from '../chat';
import { ParticipantService } from '../participant/participant.service';
import { UserAuthService } from '../user/service';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [EmailServiceHttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    FileService,
    EmailService,
    ChatService,
    UserAuthService,
    UserRepository,
    AuthStartUpService,
    ParticipantService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
