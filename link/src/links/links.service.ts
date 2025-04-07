import { Injectable } from '@nestjs/common';
import { CreateLinkDto } from '../dto/create-link.dto';
import { UpdateLinkDto } from '../dto/update-link.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLinkDto: CreateLinkDto) {
    return await this.prisma.link.create({
      data: {
        postId: createLinkDto.postId,
        userId: createLinkDto.userId,
        userStripeAccountId: createLinkDto.userStripeAccountId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.link.findMany({
      where: {
        userId,
      },
    });
  }

  async findAllByPostId(postId: string) {
    return await this.prisma.link.findMany({
      where: {
        postId,
      },
    });
  }

  async click(id: string) {
    await this.prisma.link.update({
      where: {
        id,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
    await fetch(`${process.env.STRIPE_API_GATEWAY}/links/${id}/click`);
  }

  async sale(id: string) {
    await this.prisma.link.update({
      where: {
        id,
      },
      data: {
        sales: {
          increment: 1,
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.link.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateLinkDto: UpdateLinkDto) {
    return await this.prisma.link.update({
      where: {
        id,
      },
      data: {
        postId: updateLinkDto.postId,
        userId: updateLinkDto.userId,
        userStripeAccountId: updateLinkDto.userStripeAccountId,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.link.delete({
      where: {
        id,
      },
    });
  }
}
