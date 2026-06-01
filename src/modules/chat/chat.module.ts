import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { FileServiceModule } from 'src/core/services';
import { MessageModule } from '../message';
import { ParticipantModule } from '../participant';
import { UsersModule } from '../user';
import { ChatInviteModule } from '../chat-invites';

@Module({
  imports: [FileServiceModule, forwardRef(() => MessageModule), ParticipantModule, forwardRef(() => UsersModule), ChatInviteModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
