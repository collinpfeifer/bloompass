import { PartialType } from '@nestjs/mapped-types';
import { SignUpUserDto } from './signup-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(SignUpUserDto) {
  @ApiProperty()
  name?: string | undefined;

  @ApiProperty()
  phoneNumber?: string | undefined;

  @ApiProperty()
  password?: string | undefined;

  @ApiProperty()
  confirmPassword?: string | undefined;

  @ApiProperty()
  balance?: number | string;

  @ApiProperty()
  image?: string | null | undefined;

  @ApiProperty()
  refreshToken?: string | null | undefined;

  @ApiProperty()
  stripeAccountId?: string | null | undefined;

  @ApiProperty()
  onboardingComplete?: boolean | undefined;
}
