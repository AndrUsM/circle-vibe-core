import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { EmailSendParams } from './params/email-send.params';

@Injectable()
export class EmailService {
  private sendEmailUrl = 'mail/send';

  constructor(private readonly httpService: HttpService) {}

  async sendEmail(sendEmailParams: EmailSendParams): Promise<void | null> {
    try {
      const response = await this.httpService.axiosRef.post(
        this.sendEmailUrl,
        sendEmailParams,
      );

      return response.data;
    } catch {
      return null;
    }
  }
}
