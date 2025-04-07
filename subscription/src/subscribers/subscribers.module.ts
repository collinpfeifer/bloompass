import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheService } from '../cache/cache.service';
import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, CacheModule, ConfigModule],
  controllers: [SubscribersController],
  providers: [SubscribersService, CacheService],
})
export class SubscribersModule {}
