import { PartialType } from '@nestjs/mapped-types';
import { SignUpSubscriberDto } from './signup-subscriber.dto';

export class UpdateSubscriberDto extends PartialType(SignUpSubscriberDto) {
  name?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
  balance?: number | string;
  image?: string | undefined;
  refreshToken?: string | undefined;
}
