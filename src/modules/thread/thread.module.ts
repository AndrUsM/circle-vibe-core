import { Module } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { ThreadController } from './thread.controller';

@Module({
  providers: [ThreadService],
  controllers: [ThreadController],
})
export class ThreadModule {}
