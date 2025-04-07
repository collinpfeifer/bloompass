import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheService } from './cache.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    CacheService,
    // {
    //   provide: Redis,
    //   useFactory: () => {
    //     return new Redis({
    //       host: process.env.REDISHOST || 'redis', // Redis server hostname
    //       port: parseInt(process.env.REDISPORT || '6379'), // Redis server port
    //       // password: 'your_password', // Uncomment this line if Redis requires authentication
    //     });
    //   },
    // },
  ],
  exports: [
    CacheService,
    // Redis
  ],
})
export class CacheModule {}
