import { Module } from '@nestjs/common';

import { DatabaseModule, DatabaseService } from './core/database';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [DatabaseService],
})
export class AppModule {}
