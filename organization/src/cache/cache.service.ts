import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  // constructor(private readonly redis: Redis) {}
  // async set(key: string, value: string): Promise<void> {
  //   await this.redis.set(key, value);
  //   await this.redis.expire(key, 60 * 60 * 24 * 7);
  // }
  // async get(key: string): Promise<string | null> {
  //   const value = await this.redis.get(key);
  //   await this.redis.expire(key, 60 * 60 * 24 * 7);
  //   return value;
  // }
  // async del(key: string): Promise<void> {
  //   await this.redis.del(key);
  // }
}
