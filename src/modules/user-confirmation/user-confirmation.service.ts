import * as Randomstring from 'randomstring';
import { Injectable } from '@nestjs/common';

import { EmailServerAccountConfirmationByEmailContextParams, EmailServerTemplateName, getUserFullName } from '@circle-vibe/shared';

import { DatabaseService } from 'src/core';
import { GenerateConfirmationCode } from './params';
import { UserConfirmationConfirmInput } from './dtos';
import { EmailService } from 'src/core/services';

@Injectable()
export class UserConfirmationService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async generateConfirmationCode(params: GenerateConfirmationCode): Promise<string | null> {
    const code = Randomstring.generate({
      length: 6,
      charset: 'numeric',
    });

    const user = await this.databaseService.user.findUnique({
      where: {
        email: params.email,
      },
      select: {
        id: true,
        firstname: true,
        surname: true,
      },
    });

    if (!user) {
      return null;
    }

    await this.databaseService.userConfirmation.create({
      data: {
        userId: user.id,
        email: params.email,
        code,
      },
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
    const lastConfirmation = await this.databaseService.userConfirmation.findFirst({
      where: {
        email: params.email,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastConfirmation) {
      return false;
    }

    return lastConfirmation.code === params.code;
  }
}
