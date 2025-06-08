import { UserRole, UserType } from "@circle-vibe/shared";
import { ApiProperty } from "@nestjs/swagger";

export class AuthorizationInput {
  /**
   * Username
   * @example JohnDoe
   */
  @ApiProperty({
    example: 'JohnDoe',
    required: true,
  })
  username: string;

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
  avatar: File;

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
   * User address
   * @example Some street, 1
   */
  @ApiProperty({
    example: 'Some street, 1',
    required: false,
  })
  address: string;

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
  country: string;

  /**
   * User zip code
   * @example 123456
   */
  @ApiProperty({
    example: '123456',
    required: false,
  })
  zipCode: string;

  /**
   * User phones
   * @example +79999999999
   */
  @ApiProperty({
    example: '+79999999999',
    required: false,
  })
  phones: string[];

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
   * Is user secret
   * @example false
   */
  @ApiProperty({
    example: false,
    required: false,
  })
  secret: boolean;

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


// {
//   "username": "Admin",
//   "surname": "Admin",
//   "birthDate": "1990-12-12T00:00:00.000Z",
//   "password": "password123",
//   "passwordConfirmation": "password123",
//   "isHiddenContactInfo": true,
//   "city": "Kiev",
//   "country": "Ukraine",
//   "email": "test@example.com",
//   "primaryPhone": "+79999999999",
//   "type": "PRIVATE",
//   "role": "ADMIN"
// }
