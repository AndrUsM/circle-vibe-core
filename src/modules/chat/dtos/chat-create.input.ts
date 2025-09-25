import { ApiProperty } from '@nestjs/swagger';
import { ChatType } from '@circle-vibe/shared';

export class ChatCreateInputDto {
  @ApiProperty({
    example: 'name',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'description',
    required: true,
  })
  description: string;

  @ApiProperty({
    example: 'PUBLIC',
    required: true,
  })
  type: ChatType;

  @ApiProperty({
    example: '10',
    required: false,
  })
  usersLimit: number;
}
