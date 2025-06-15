import { ApiProperty } from '@nestjs/swagger';

export class AuthentificationInput {
  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: 'test@example.com',
    required: true,
  })
  email: string;
}
