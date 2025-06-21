import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { FileServiceModule } from './core/services';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';
import { ChatGatewayModule } from './gateways/chat';
import { UsersModule } from './modules/user/user.module';
import { ParticipantModule } from './modules/participant/participant.module';

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
  ],
  providers: [DatabaseService],
})
export class AppModule {}
