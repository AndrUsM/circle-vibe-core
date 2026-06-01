import { Module } from '@nestjs/common';
import { UserConfirmationController } from './user-confirmation.controller';
import { UserConfirmationService } from './services';
import { UserConfirmationCodeGenerationService } from './services';
import { UserConfirmationRepository } from './user-confirmation.repository';
import { EmailServiceModule } from 'src/core/services';
import { UserService, UserAuthService, UserRepository } from '../user';
import { FileServiceModule } from 'src/core/services';

@Module({
  imports: [EmailServiceModule, FileServiceModule],
  controllers: [UserConfirmationController],
  providers: [UserConfirmationService, UserConfirmationCodeGenerationService, UserConfirmationRepository, UserService, UserAuthService, UserRepository],
})
export class UserConfirmationModule {}
