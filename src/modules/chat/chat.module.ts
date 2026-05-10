import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ParticipantService } from '../participant/participant.service';
import { UserService } from '../user';
import { ChatInviteService } from '../chat-invites';
import { FileService } from 'src/core/services';
import { MessageService, MessageRepository, MessageMappers } from '../message';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    ParticipantService,
    UserService,
    ChatInviteService,
    FileService,
    MessageService,
    MessageRepository,
    MessageMappers
  ],
})
export class ChatModule {}
