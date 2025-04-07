import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('accounts')
  async createAccount(@Body() body: Stripe.AccountCreateParams) {
    const account = await this.stripeService.createAccount(body);
    return account;
  }

  @Get('accounts/:id')
  async retreiveAccount(@Param('id') id: string) {
    const account = await this.stripeService.retrieveAccount(id);
    return account;
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string) {
    const account = await this.stripeService.deleteAccount(id);
    return account;
  }

  @Post('accounts/links')
  async createAccountLink(
    @Body()
    body: {
      account: string;
      returnUrl: string;
      refreshUrl: string;
    },
  ) {
    const accountLink = await this.stripeService.createAccountLink(body);
    return accountLink;
  }

  @Post('login/links')
  async createLoginLink(@Body() body: { accountId: string }) {
    const loginLink = await this.stripeService.createLoginLink(body.accountId);
    return loginLink;
  }

  @Post('paymentintents')
  async createPaymentIntent(
    @Body() body: { amount: number; accountId: string },
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(body);
    return paymentIntent;
  }

  @Post('checkoutsessions')
  async createCheckoutSession(
    @Body()
    body: {
      name: string;
      price: string;
      accountId: string | undefined;
      successUrl: string;
      organizationStripeId: string;
      postId: string;
      image: string;
      address: string;
      dateTime: string;
      cancelUrl: string;
    },
  ) {
    return await this.stripeService.createCheckoutSession(body);
  }

  @Get('checkoutsessions/:id')
  async getCheckoutSession(@Param('id') id: string) {
    return await this.stripeService.retrieveCheckoutSession(id);
  }

  @Get('links/:id/clicks')
  async addLinkClick(@Param('id') id: string) {
    return await this.stripeService.addClick(id);
  }

  @Post('webhook')
  async handleWebhook(@Req() request: RawBodyRequest<Request>) {
    return await this.stripeService.handleWebhook(request);
  }
}
