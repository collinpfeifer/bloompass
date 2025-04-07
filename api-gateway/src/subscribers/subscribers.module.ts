import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}), PassportModule],
  controllers: [SubscribersController],
  providers: [SubscribersService, ConfigService, JwtService],
})
export class SubscribersModule {}
