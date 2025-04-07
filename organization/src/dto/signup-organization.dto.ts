import { ApiProperty } from '@nestjs/swagger';

export class SignUpOrganizationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
