import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule } from './stripe/stripe.module';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), StripeModule],
  controllers: [StripeController],
  providers: [StripeService, ConfigService],
})
export class AppModule {}
