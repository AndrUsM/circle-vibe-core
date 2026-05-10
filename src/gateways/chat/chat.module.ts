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
import { ParticipantService, ParticipantGatewayStateService } from 'src/modules';
import { ChatGatewayService } from './chat-gateway.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    MessageService,
    MessageRepository,
    MessageMappers,
    AuthService,
    UserService,
    FileService,
    ParticipantService,
    ParticipantGatewayStateService,
    ChatGatewayService,
    ThreadService,
  ],
})
export class ChatGatewayModule {}
