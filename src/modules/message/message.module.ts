import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { FileService } from 'src/core/services';
import { ChatService } from '../chat';

@Module({
  providers: [MessageService, FileService, ChatService],
  controllers: [MessageController]
})
export class MessageModule {}
