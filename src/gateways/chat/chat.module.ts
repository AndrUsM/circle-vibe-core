import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import {
  AuthService,
  ChatService,
  MessageService,
  UserService,
} from 'src/modules';
import { FileService } from 'src/core/services';
import { ParticipantService, ParticipantGatewayStateService } from 'src/modules';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    MessageService,
    AuthService,
    UserService,
    FileService,
    ParticipantService,
    ParticipantGatewayStateService,
  ],
})
export class ChatGatewayModule {}
