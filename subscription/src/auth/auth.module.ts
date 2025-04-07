import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SubscribersModule } from 'src/subscribers/subscribers.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { SubscribersService } from 'src/subscribers/subscribers.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [SubscribersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    SubscribersService,
    AccessTokenStrategy,
    ConfigService,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
