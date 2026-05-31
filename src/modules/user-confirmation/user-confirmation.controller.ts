import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { UserConfirmationService } from './user-confirmation.service';
import { UserConfirmationConfirmInput, UserConfirmationGenerateCode } from './dtos';

@Controller('user-confirmation')
export class UserConfirmationController {
  constructor(private readonly userConfirmationService: UserConfirmationService) {}

  @Post('generate-code')
  @HttpCode(HttpStatus.OK)
  async generateConfirmationCode(@Body() userConfirmationGenerateCodeInputDto: UserConfirmationGenerateCode) {
    if (!userConfirmationGenerateCodeInputDto?.email) {
      throw new BadRequestException();
    }

    const response = await this.userConfirmationService.generateConfirmationCode(userConfirmationGenerateCodeInputDto);

    if (!response) {
      throw new BadRequestException();
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async confirmAccount(@Body() confirmAccountInputDto: UserConfirmationConfirmInput) {
    if (!confirmAccountInputDto?.email || !confirmAccountInputDto?.code) {
      throw new BadRequestException();
    }

    return this.userConfirmationService.confirmAccount(confirmAccountInputDto);
  }
}
