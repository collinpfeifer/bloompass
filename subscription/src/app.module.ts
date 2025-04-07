import { Module } from '@nestjs/common';
import { SubscribersController } from './subscribers/subscribers.controller';
import { SubscribersService } from './subscribers/subscribers.service';
import { SubscribersModule } from './subscribers/subscribers.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SubscribersModule,
    AuthModule,
    CacheModule,
  ],
  controllers: [SubscribersController, AuthController],
  providers: [SubscribersService, AuthService, JwtService],
})
export class AppModule {}
