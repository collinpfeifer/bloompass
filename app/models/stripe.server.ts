import invariant from 'tiny-invariant';
import Stripe from 'stripe';
import { getTicket } from './ticket.server';

invariant(process.env.STRIPE_SECRET_KEY, 'Missing Stripe secret key');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createAccount(body: Stripe.AccountCreateParams) {
    const account = await stripe.accounts.create(body);
    return account;
  }

  async function retrieveAccount(accountId: string) {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  }

  async function deleteAccount(accountId: string) {
    const account = await stripe.accounts.del(accountId);
    return account;
  }

  async function createAccountLink({
    refreshUrl,
    returnUrl,
    account,
  }: {
    refreshUrl: string;
    returnUrl: string;
    account: string;
  }) {
    const accountLink = await stripe.accountLinks.create({
      account,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  }

  async function createLoginLink(accountId: string) {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  }

  async function createPaymentIntent({
    amount,
    accountId,
  }: {
    amount: number;
    accountId?: string;
  }) {
    const paymentIntent = await stripe.paymentIntents.create(
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

  async function createCheckoutSession({
    userId,
    successUrl,
    cancelUrl,
    ticketId,
  }: {
    userId?: string;
    linkId?: string;
    successUrl: string;
    cancelUrl: string;
    postId: string;
  }) {
    const ticket = await getTicket({ id: ticketId });
    
    return await stripe.checkout.sessions.create(
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
                name: ticket.title,
              },
              unit_amount: parseInt(ticket.price) * 100,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Bloompass Fee',
              },
              unit_amount:
                parseFloat(ticket.price) * 0.1 * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          passId: uuidv4(),
          postId,
          linkId: linkId || null,
        },
        payment_intent_data: {
          transfer_data: {
            destination: ticket.user.stripeAccountId,
            amount: parseFloat(ticket.price) * 100,
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

  async function retrieveCheckoutSession(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  }

  async function payout(accountId: string) {
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    const { amount, currency } = balance.available[0];

    const payout = await stripe.payouts.create(
      {
        amount,
        currency,
        statement_descriptor: 'Bloompass Payout',
      },
      {
        stripeAccount: accountId,
      },
    );

    return payout;
    }
  async function handleWebhook(request: Request) {
    if (
      process.env.ENDPOINT_SECRET &&
      typeof process.env.ENDPOINT_SECRET === 'string'
    ) {
      // Get the signature sent by Stripe
      const payload = await request.text();

      const signature = request.headers['stripe-signature'];
      if (!signature) throw new Error('Stripe signature is missing');
      try {
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          process.env.ENDPOINT_SECRET,
        );
        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            // Then define and call a method to handle the successful payment intent.
            console.log('Payment intent', paymentIntent);

            
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