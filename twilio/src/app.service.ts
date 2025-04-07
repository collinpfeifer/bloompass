import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendVerificationText(
    phoneNumber: string,
    verificationCode: string,
  ): Promise<void> {
    try {
      const message = await this.client.messages.create({
        body: `Your verification code is: ${verificationCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      console.log(`Verification message sent. Message SID: ${message.sid}`);
    } catch (error) {
      console.error('Error sending verification text:', error);
      throw new Error('Failed to send verification text');
    }
  }

  async sendAttachment(
    phoneNumber: string,
    attachmentUrl: string,
  ): Promise<void> {
    try {
      const message = await this.client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        mediaUrl: [attachmentUrl],
        to: phoneNumber,
      });
      console.log(`Attachment message sent. Message SID: ${message.sid}`);
    } catch (error) {
      console.error('Error sending attachment:', error);
      throw new Error('Failed to send attachment');
    }
  }
}
