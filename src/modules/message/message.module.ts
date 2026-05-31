import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { FileService } from 'src/core/services';
import { ChatService } from '../chat';
import { MessageRepository } from './message.repository';
import { MessageMappers } from './message.mappers';

@Module({
  providers: [MessageService, FileService, ChatService, MessageRepository, MessageMappers],
  controllers: [MessageController],
})
export class MessageModule {}
