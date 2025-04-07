import { Injectable } from '@nestjs/common';
import { SignUpUserDto } from 'src/dto/signup-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(signUpUser: SignUpUserDto) {
    return await this.prisma.user.create({
      data: {
        name: signUpUser.name,
        phoneNumber: signUpUser.phoneNumber,
        password: signUpUser.password,
      },
    });
  }

  async findOne(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({
      where,
    });
  }

  async update(where: Prisma.UserWhereUniqueInput, updateUser: UpdateUserDto) {
    return await this.prisma.user.update({
      where,
      data: {
        name: updateUser.name,
        phoneNumber: updateUser.phoneNumber,
        password: updateUser.password,
        image: updateUser.image,
        refreshToken: updateUser.refreshToken,
        stripeAccountId: updateUser.stripeAccountId,
        onboardingComplete: updateUser.onboardingComplete,
      },
    });
  }

  async remove(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({
      where,
    });
  }
}
