import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { FileServiceModule } from './core/services';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [DatabaseModule, AuthModule, FileServiceModule, ChatModule, MessageModule],
  providers: [DatabaseService],
})
export class AppModule {}
