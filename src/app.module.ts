import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { FileServiceModule, EmailServiceModule, EmailServiceHttpModule } from './core/services';
import { ChatGatewayModule } from './gateways/chat';

import {
  AuthModule,
  MessageModule,
  UsersModule,
  ParticipantModule,
  ParticipantGatewayStateModule,
  ChatInviteModule,
  ChatModule,
  ThreadModule
} from './modules';
import { UserConfirmationModule } from './modules/user-confirmation';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    FileServiceModule,
    EmailServiceModule,
    ChatModule,
    MessageModule,
    ChatGatewayModule,
    ParticipantModule,
    ChatInviteModule,
    UserConfirmationModule,
    ParticipantGatewayStateModule,
    ThreadModule,
    EmailServiceHttpModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
