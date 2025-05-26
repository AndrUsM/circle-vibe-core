import { ApiProperty } from '@nestjs/swagger';

export class AuthentificationInput {
  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: '1234567890',
    required: true,
  })
  identificationKey: string;
}
