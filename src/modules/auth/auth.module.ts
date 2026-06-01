import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailServiceHttpModule, FileServiceModule } from 'src/core/services';
import { AuthStartUpService } from './services';
import { ChatService } from '../chat';
import { ParticipantService, ParticipantRepository } from '../participant';
import { UsersModule } from '../user';

@Module({
  imports: [EmailServiceHttpModule, FileServiceModule, forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [ChatService, ParticipantService, ParticipantRepository, AuthService, AuthStartUpService],
  exports: [AuthService],
})
export class AuthModule {}
