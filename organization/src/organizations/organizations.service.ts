import { Injectable } from '@nestjs/common';
import { SignUpOrganizationDto } from 'src/dto/signup-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(signUpOrganization: SignUpOrganizationDto) {
    return await this.prisma.organization.create({
      data: {
        name: signUpOrganization.name,
        email: signUpOrganization.email,
        password: signUpOrganization.password,
      },
    });
  }

  async findOne(where: Prisma.OrganizationWhereUniqueInput) {
    return await this.prisma.organization.findUnique({
      where,
    });
  }

  async update(
    where: Prisma.OrganizationWhereUniqueInput,
    updateOrganization: UpdateOrganizationDto,
  ) {
    return await this.prisma.organization.update({
      where,
      data: {
        name: updateOrganization.name,
        email: updateOrganization.email,
        password: updateOrganization.password,
        image: updateOrganization.image,
        refreshToken: updateOrganization.refreshToken,
        stripeAccountId: updateOrganization.stripeAccountId,
        onboardingComplete: updateOrganization.onboardingComplete,
      },
    });
  }

  async remove(where: Prisma.OrganizationWhereUniqueInput) {
    return await this.prisma.organization.delete({
      where,
    });
  }
}
