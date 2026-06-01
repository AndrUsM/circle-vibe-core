import { Injectable } from '@nestjs/common';

import { EmailServerAccountConfirmationByEmailContextParams, EmailServerTemplateName, getUserFullName } from '@circle-vibe/shared';

import { GenerateConfirmationCode } from '../params';
import { UserConfirmationConfirmInput } from '../dtos';
import { EmailService } from 'src/core/services';
import { UserConfirmationRepository } from '../user-confirmation.repository';
import { UserService } from '../../user';
import { UserConfirmationCodeGenerationService } from './user-confirmation-code-generation.service';

@Injectable()
export class UserConfirmationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly userConfirmationCodeGenerationService: UserConfirmationCodeGenerationService,
    private readonly userConfirmationRepository: UserConfirmationRepository,
  ) {}

  async generateConfirmationCode(params: GenerateConfirmationCode): Promise<string | null> {
    const code = this.userConfirmationCodeGenerationService.generateCode();
    const user = await this.userService.getByEmail(params.email);

    if (!user) {
      return null;
    }

    await this.userConfirmationRepository.create({
      userId: user?.id,
      email: user?.email,
      code,
    });

    const templateContext: EmailServerAccountConfirmationByEmailContextParams = {
      name: getUserFullName(user),
      confirmationCode: code,
    };

    await this.emailService.sendEmail({
      emails: [params.email],
      subject: 'Account confirmation',
      template: EmailServerTemplateName.ACCOUNT_CONFIRMATION_BY_EMAIL,
      templateContext,
    });

    return code;
  }

  async confirmAccount(params: UserConfirmationConfirmInput): Promise<boolean> {
    const lastConfirmation = await this.userConfirmationRepository.getLastConfirmation(params?.email);

    if (!lastConfirmation) {
      return false;
    }

    return lastConfirmation.code === params.code;
  }
}
