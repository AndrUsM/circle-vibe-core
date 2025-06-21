import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthService, ChatService, MessageService, UserService } from 'src/modules';
import { FileService } from 'src/core/services';
import { ParticipantService } from 'src/modules/participant/participant.service';

@Module({
  providers: [ChatGateway, ChatService, MessageService, AuthService, UserService, FileService, ParticipantService,],
})
export class ChatGatewayModule {}