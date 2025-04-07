import { Injectable } from '@nestjs/common';
import { SignUpSubscriberDto } from '../dto/signup-subscriber.dto';
import { UpdateSubscriberDto } from '../dto/update-subscriber.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriberWhereUniqueInput } from '../dto/subscriber-where-unique-input.dto';

@Injectable()
export class SubscribersService {
  constructor(private prisma: PrismaService) {}

  async create(signUpSubscriber: SignUpSubscriberDto) {
    return await this.prisma.subscriber.create({
      data: {
        name: signUpSubscriber.name,
        email: signUpSubscriber.email,
        password: signUpSubscriber.password,
        image: signUpSubscriber.image,
        refreshToken: signUpSubscriber.refreshToken,
        accountAuthToken: signUpSubscriber.accountAuthToken,
      },
    });
  }

  async findOne(where: SubscriberWhereUniqueInput) {
    return await this.prisma.subscriber.findUnique({
      where,
    });
  }

  async update(
    where: SubscriberWhereUniqueInput,
    updateSubscriber: UpdateSubscriberDto,
  ) {
    return await this.prisma.subscriber.update({
      where,
      data: {
        name: updateSubscriber.name,
        email: updateSubscriber.email,
        password: updateSubscriber.password,
        image: updateSubscriber.image,
        refreshToken: updateSubscriber.refreshToken,
        accountAuthToken: updateSubscriber.accountAuthToken,
      },
    });
  }

  async remove(where: SubscriberWhereUniqueInput) {
    await this.prisma.subscriber.delete({
      where,
    });
  }
}
