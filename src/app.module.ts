import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { FileServiceModule, SecurityModule } from './core/services';
import { ChatGatewayModule } from './gateways/chat';

import {
  AuthModule,
  MessageModule,
  UsersModule,
  ParticipantModule,
  ParticipantGatewayStateModule,
  ChatInviteModule,
  ChatModule,
} from './modules';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    FileServiceModule,
    ChatModule,
    MessageModule,
    ChatGatewayModule,
    ParticipantModule,
    ChatInviteModule,
    SecurityModule,
    ParticipantGatewayStateModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
