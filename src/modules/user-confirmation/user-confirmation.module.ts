import { Module } from '@nestjs/common';
import { UserConfirmationController } from './user-confirmation.controller';
import { UserConfirmationService } from './user-confirmation.service';
import { EmailService } from 'src/core/services';

@Module({
  controllers: [UserConfirmationController],
  providers: [UserConfirmationService, EmailService,]
})
export class UserConfirmationModule {}
