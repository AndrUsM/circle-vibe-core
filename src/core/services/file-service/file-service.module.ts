import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileServiceHttpModule } from './file-service-http.module';

@Module({
  imports: [FileServiceHttpModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileServiceModule {}