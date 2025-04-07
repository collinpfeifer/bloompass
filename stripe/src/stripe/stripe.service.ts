import { Injectable, RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAuth } from 'google-auth-library';
import invariant from 'tiny-invariant';

@Injectable()
export class StripeService {
  stripe: Stripe;
  auth: GoogleAuth;
  constructor() {
    if (!process.env.STRIPE_TEST_API_KEY) {
      throw new Error('STRIPE_TEST_API_KEY is undefined');
    }
    this.stripe = new Stripe(process.env.STRIPE_TEST_API_KEY, {
      apiVersion: '2022-11-15',
    });
    this.auth = new GoogleAuth();
  }

  async createAccount(body: Stripe.AccountCreateParams) {
    const account = await this.stripe.accounts.create(body);
    return account;
  }

  async retrieveAccount(accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    return account;
  }

  async deleteAccount(accountId: string) {
    const account = await this.stripe.accounts.del(accountId);
    return account;
  }

  async createAccountLink({
    refreshUrl,
    returnUrl,
    account,
  }: {
    refreshUrl: string;
    returnUrl: string;
    account: string;
  }) {
    const accountLink = await this.stripe.accountLinks.create({
      account,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  }

  async createLoginLink(accountId: string) {
    const loginLink = await this.stripe.accounts.createLoginLink(accountId);
    return loginLink;
  }

  async createPaymentIntent({
    amount,
    accountId,
  }: {
    amount: number;
    accountId?: string;
  }) {
    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        automatic_payment_methods: { enabled: true },
        confirm: true,
      },
      {
        stripeAccount: accountId,
      },
    );
    return paymentIntent;
  }

  async createCheckoutSession({
    userId,
    successUrl,
    cancelUrl,
    linkId,
    postId,
  }: {
    userId?: string;
    linkId?: string;
    successUrl: string;
    cancelUrl: string;
    postId: string;
  }) {
    const post = await fetch(
      `${process.env.POST_API_GATEWAY}/posts/${postId}`,
      {
        method: 'GET',
      },
    )
      .then((res: Response) => res.json())
      .catch((err: Error) => console.log(err));
    const link = await fetch(
      `${process.env.POST_API_GATEWAY}/links/${linkId}`,
      {
        method: 'GET',
      },
    )
      .then((res: Response) => res.json())
      .catch((err: Error) => console.log(err));
    const audience = process.env.AUDIENCE;
    invariant(audience, 'audience is undefined');
    const client = await this.auth.getIdTokenClient(audience);
    const { data: organization } = await client.request({
      url: `${process.env.ORGANIZATION_API_GATEWAY}/organizations/${post.organization_id}`,
      method: 'GET',
    });
    const { data: user } = await client.request({
      url: `${process.env.USER_API_GATEWAY}/users/${userId}`,
      method: 'GET',
    });

    const image = await fetch(
      `${process.env.IMAGE_API_GATEWAY}/images/${post.image}`,
      {
        method: 'GET',
      },
    )
      .then((res: Response) => res.json())
      .catch((err: Error) => console.log(err));

    return await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        automatic_tax: {
          enabled: true,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: post.title,
                images: [image],
              },
              unit_amount: parseInt(post.price) * 100,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Adfluent Fee',
              },
              unit_amount:
                parseFloat(post.price) * 0.1 * 100 + (linkId ? 0 : 100),
            },
            quantity: 1,
          },

          linkId
            ? {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: 'Affiliate Fee',
                  },
                  unit_amount: 100,
                },
              }
            : {},
        ],
        metadata: {
          passId: uuidv4(),
          postId,
          linkId: linkId || null,
        },
        payment_intent_data: {
          transfer_data: {
            destination: organization.stripeAccountId,
            amount: parseFloat(post.price) * 100,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        stripeAccount: user.stripeAccountId,
      },
    );
  }

  async retrieveCheckoutSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session;
  }

  async payout(accountId: string) {
    const balance = await this.stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    const { amount, currency } = balance.available[0];

    const payout = await this.stripe.payouts.create(
      {
        amount,
        currency,
        statement_descriptor: 'Adfluent Payout',
      },
      {
        stripeAccount: accountId,
      },
    );

    return payout;
  }

  async createAffiliateTransfer({
    paymentIntentId,
    affiliateId,
    amountToAffiliate,
  }: {
    paymentIntentId: string;
    affiliateId: string;
    amountToAffiliate: number;
  }) {
    try {
      const transferToAffiliate = await this.stripe.transfers.create({
        amount: amountToAffiliate * 100,
        currency: 'usd',
        destination: affiliateId,
        source_transaction: paymentIntentId,
      });

      return transferToAffiliate;
    } catch (error) {
      console.error('Error while creating transfers:', error);
      throw error;
    }
  }

  async addSale(linkId: string) {
    const audience = process.env.AUDIENCE;
    invariant(audience, 'Auth0 audience is undefined');
    const client = await this.auth.getIdTokenClient(audience);
    const res = await client.request({
      url: `${process.env.LINK_API_GATEWAY}/links/${linkId}/sale`,
      method: 'GET',
    });
    return res.data;
  }

  async addClick(linkId: string) {
    const paymentIntent = await this.createPaymentIntent({
      amount: 1,
    });
    const link = await fetch(
      `${process.env.LINK_API_GATEWAY}/links/${linkId}`,
      {
        method: 'GET',
      },
    )
      .then((res) => res.json())
      .catch((err) => console.log(err));
    if (link.clicks < 50) {
      const transfer = await this.createAffiliateTransfer({
        paymentIntentId: paymentIntent.id,
        affiliateId: link.userStripeAccountId,
        amountToAffiliate: 0.01,
      });
      console.log('transfer', transfer);
    }
    const audience = process.env.AUDIENCE;
    invariant(audience, 'Auth0 audience is undefined');
    const client = await this.auth.getIdTokenClient(audience);
    const res = await client.request({
      url: `${process.env.LINK_API_GATEWAY}/links/${linkId}/click`,
      method: 'GET',
    });
    return res.data;
  }

  async handleWebhook(request: RawBodyRequest<Request>) {
    if (
      process.env.ENDPOINT_SECRET &&
      typeof process.env.ENDPOINT_SECRET === 'string'
    ) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature'];
      if (!signature) throw new Error('Stripe signature is missing');
      if (request.rawBody === undefined)
        throw new Error('Raw body is undefined');
      try {
        const event = this.stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          process.env.ENDPOINT_SECRET,
        );
        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            // Then define and call a method to handle the successful payment intent.
            console.log('Payment intent', paymentIntent);

            const dateTimeString =
              paymentIntent.metadata.dateTime &&
              typeof paymentIntent.metadata.dateTime === 'string'
                ? new Date(
                    Date.parse(paymentIntent.metadata.dateTime),
                  ).toISOString()
                : '';
            const audience = process.env.AUDIENCE;
            invariant(audience, 'audience is undefined');
            const client = await this.auth.getIdTokenClient(audience);
            const response = await client.request({
              url: `${process.env.PASS_API_GATEWAY}/passes`,
              method: 'POST',
              body: JSON.stringify({
                id: paymentIntent.metadata.passId,
                title: paymentIntent.metadata.title,
                date_time: dateTimeString,
                address: paymentIntent.metadata.address,
                price: paymentIntent.metadata.price,
                post_id: paymentIntent.metadata.postId,
                image: paymentIntent.metadata.image,
              }),
            });
            console.log('response', response.data);
            if (paymentIntent.metadata.affiliateStripeAccountId) {
              const transfer = await this.createAffiliateTransfer({
                paymentIntentId: paymentIntent.id,
                affiliateId: paymentIntent.metadata.affiliateStripeAccountId,
                amountToAffiliate: 1,
              });
              const response = await this.addSale(
                paymentIntent.metadata.linkId,
              );
              console.log('transfer', transfer);
              console.log('sale response', response);
            } else {
            }
            break;
          default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
        }

        // Return a 200 response to acknowledge receipt of the event
        return { received: true };
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return Error('Webhook signature verification failed.');
      }
    }
  }
}
