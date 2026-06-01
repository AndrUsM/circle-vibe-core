import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageMappers } from './message.mappers';
import { MessageRepository } from './message.repository';
import { FileServiceModule } from 'src/core/services';
import { ChatModule } from '../chat';

@Module({
  imports: [FileServiceModule, forwardRef(() => ChatModule)],
  providers: [MessageService, MessageRepository, MessageMappers],
  controllers: [MessageController],
  exports: [MessageService, MessageRepository, MessageMappers],
})
export class MessageModule {}
