import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import {
  AuthService,
  ChatService,
  MessageMappers,
  MessageRepository,
  MessageService,
  ThreadService,
  UserService,
} from 'src/modules';
import { FileService } from 'src/core/services';
import {
  ParticipantService,
  ParticipantGatewayStateService,
} from 'src/modules';
import { ChatGatewayService } from './chat-gateway.service';
import { UserAuthService } from '../../modules/user/service';
import { UserRepository } from '../../modules/user/user.repository';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    MessageService,
    MessageRepository,
    MessageMappers,
    AuthService,
    UserService,
    UserAuthService,
    UserRepository,
    FileService,
    ParticipantService,
    ParticipantGatewayStateService,
    ChatGatewayService,
    ThreadService,
  ],
})
export class ChatGatewayModule {}
