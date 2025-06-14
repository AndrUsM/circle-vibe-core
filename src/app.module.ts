import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { FileServiceModule } from './core/services';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule, FileServiceModule],
  providers: [DatabaseService],
})
export class AppModule {}
