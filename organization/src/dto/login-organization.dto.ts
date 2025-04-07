import { ApiProperty } from '@nestjs/swagger';

export class LoginOrganizationDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export type LoginOrganizationDtoType = {
  email: string;
  password: string;
};
