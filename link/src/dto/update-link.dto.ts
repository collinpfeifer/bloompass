import { PartialType } from '@nestjs/mapped-types';
import { CreateLinkDto } from './create-link.dto';

export class UpdateLinkDto extends PartialType(CreateLinkDto) {
  postId: string;
  userId: string;
  userStripeAccountId: string;
}
