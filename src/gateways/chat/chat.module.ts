import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthService, ChatService, MessageMappers, MessageRepository, MessageService, ThreadService, UserService } from 'src/modules';
import { ParticipantService, ParticipantRepository, ParticipantGatewayStateService } from 'src/modules';
import { ChatGatewayService } from './chat-gateway.service';
import { UserAuthService, UserRepository } from '../../modules/user';
import { FileServiceModule } from 'src/core/services';

@Module({
  imports: [FileServiceModule],
  providers: [
    ChatGateway,
    ChatService,
    MessageService,
    MessageRepository,
    MessageMappers,
    AuthService,
    UserService,
    UserAuthService,
    UserRepository,
    ParticipantService,
    ParticipantRepository,
    ParticipantGatewayStateService,
    ChatGatewayService,
    ThreadService,
  ],
})
export class ChatGatewayModule {}
