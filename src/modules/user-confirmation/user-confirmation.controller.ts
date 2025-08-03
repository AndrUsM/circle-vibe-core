import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { UserConfirmationService } from './user-confirmation.service';
import { UserConfirmationConfirmInput, UserConfirmationGenerateCode } from './dtos';

@Controller('user-confirmation')
export class UserConfirmationController {
  constructor(
    private readonly userConfirmationService: UserConfirmationService,
  ) {}

  @Post('generate-code')
  @HttpCode(200)
  async generateConfirmationCode(
    @Body() userConfirmationGenerateCodeInputDto: UserConfirmationGenerateCode,
  ) {
    if (!userConfirmationGenerateCodeInputDto?.email) {
      return new BadRequestException();
    }

    const response = await this.userConfirmationService.generateConfirmationCode(
      userConfirmationGenerateCodeInputDto,
    );

    if (!response) {
      return new BadRequestException();
    }
  }

  @Post()
  async confirmAccount(@Body() confirmAccountInputDto: UserConfirmationConfirmInput) {
    if (!confirmAccountInputDto?.email || !confirmAccountInputDto?.code) {
      return new BadRequestException();
    }

    return this.userConfirmationService.confirmAccount(confirmAccountInputDto);
  }
}
