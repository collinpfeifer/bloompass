import { PartialType } from '@nestjs/swagger';
import { SignUpUserDto } from './signup-user.dto';

export class UpdateUserDto extends PartialType(SignUpUserDto) {
  name?: string | undefined;
  phoneNumber?: string | undefined;
  image?: string | undefined;
  password?: string | undefined;
  refreshToken?: string | undefined;
}
