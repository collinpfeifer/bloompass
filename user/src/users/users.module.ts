import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheService } from '../cache/cache.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule, ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, CacheService],
})
export class UsersModule {}
