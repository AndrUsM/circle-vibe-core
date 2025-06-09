import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { FileService } from './file.service';

@Module({
  imports: [HttpModule],
  providers: [FileService],
})
export class FileServiceModule {}
