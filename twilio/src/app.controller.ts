import { Controller, Post, Body, Param } from '@nestjs/common';
import { TwilioService } from './app.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send-verification')
  async sendVerificationText(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<void> {
    const verificationCode = '123456'; // Generate or retrieve the verification code
    await this.twilioService.sendVerificationText(
      phoneNumber,
      verificationCode,
    );
  }

  @Post('send-attachment')
  async sendAttachment(
    @Param('phoneNumber') phoneNumber: string,
    @Body('attachmentUrl') attachmentUrl: string,
  ): Promise<void> {
    await this.twilioService.sendAttachment(phoneNumber, attachmentUrl);
  }
}
