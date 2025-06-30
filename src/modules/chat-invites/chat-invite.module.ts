import { Module } from '@nestjs/common';
import { ChatInviteService } from './chat-invite.service';

@Module({
  providers: [ChatInviteService],
  exports: [ChatInviteService],
})
export class ChatInviteModule {}
