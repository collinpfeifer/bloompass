import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheService } from '../cache/cache.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule, ConfigModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, CacheService],
})
export class OrganizationsModule {}
