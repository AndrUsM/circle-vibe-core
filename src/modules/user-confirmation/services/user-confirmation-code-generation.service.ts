import { Injectable } from '@nestjs/common';
import * as Randomstring from 'randomstring';

@Injectable()
export class UserConfirmationCodeGenerationService {
  generateCode(): string {
    return Randomstring.generate({
      length: 6,
      charset: 'numeric',
    });
  }
}
