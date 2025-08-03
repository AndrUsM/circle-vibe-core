import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailServiceHttpModule } from './email-service-http.module';

@Module({
  imports: [EmailServiceHttpModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailServiceModule {}