import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthService, ChatService, MessageService, UserService } from 'src/modules';
import { FileService } from 'src/core/services';

@Module({
  providers: [ChatGateway, ChatService, MessageService, AuthService, UserService, FileService],
})
export class ChatGatewayModule {}