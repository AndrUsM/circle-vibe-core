import { CountryCode, UserRole, UserType } from "@circle-vibe/shared";
import { ApiProperty } from "@nestjs/swagger";

export class AuthorizationInput {
  /**
   * Username
   * @example JohnDoe123
   */
  @ApiProperty({
    example: 'JohnDoe123',
    required: true,
  })
  username: string;

  @ApiProperty({
    example: 'John',
    required: true,
  })
  firstname: string;

  /**
   * User surname
   * @example Doe
   */
  @ApiProperty({
    example: 'Doe',
    required: true,
  })
  surname: string;

  /**
   * User birth date
   * @example 1990-12-12T00:00:00.000Z
   */
  @ApiProperty({
    example: '1990-12-12T00:00:00.000Z',
    required: true,
  })
  birthDate: Date;

  /**
   * User password
   * @example password123
   */
  @ApiProperty({
    example: 'password123',
    required: true,
  })
  password: string;

  /**
   * User password confirmation
   * @example password123
   */
  @ApiProperty({
    example: 'password123',
    required: true,
  })
  passwordConfirmation: string;

  /**
   * User avatar
   * @example https://example.com/avatar.jpg
   */
  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl: string;

  /**
   * Is user contact info hidden
   * @example true
   */
  @ApiProperty({
    example: true,
    required: false,
  })
  isHiddenContactInfo: boolean;

    /**
   * Is user hidden from search
   * @example true
   */
  @ApiProperty({
    example: true,
    required: false,
  })
  isAllowedToSearch: boolean;

  /**
   * User city
   * @example Moscow
   */
  @ApiProperty({
    example: 'Moscow',
    required: false,
  })
  city: string;

  /**
   * User country
   * @example Russia
   */
  @ApiProperty({
    example: 'Russia',
    required: false,
  })
  country: CountryCode;

  /**
   * User email
   * @example test@example.com
   */
  @ApiProperty({
    example: 'test@example.com',
    required: true,
  })
  email: string;

  /**
   * User primary phone
   * @example +79999999999
   */
  @ApiProperty({
    example: '+79999999999',
    required: false,
  })
  primaryPhone: string;

  /**
   * User type
   * @example PRIVATE
   */
  @ApiProperty({
    example: UserType.PRIVATE,
    required: true,
  })
  type: UserType;

  /**
   * User role
   * @example ADMIN
   */
  @ApiProperty({
    example: UserRole.ADMIN,
    required: true,
  })
  role: UserRole;
}
