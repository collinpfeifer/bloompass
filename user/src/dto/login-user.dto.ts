import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  password: string;
}

export type LoginUserDtoType = {
  phoneNumber: string;
  password: string;
};
