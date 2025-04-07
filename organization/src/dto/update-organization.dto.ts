import { PartialType } from '@nestjs/mapped-types';
import { SignUpOrganizationDto } from './signup-organization.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto extends PartialType(SignUpOrganizationDto) {
  @ApiProperty()
  name?: string | undefined;

  @ApiProperty()
  email?: string | undefined;

  @ApiProperty()
  password?: string | undefined;

  @ApiProperty()
  image?: string | undefined;

  @ApiProperty()
  refreshToken?: string | null | undefined;

  @ApiProperty()
  stripeAccountId?: string | null | undefined;

  @ApiProperty()
  onboardingComplete?: boolean | undefined;
}
