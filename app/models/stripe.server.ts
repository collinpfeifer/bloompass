import invariant from 'tiny-invariant';
import Stripe from 'stripe';
import { getTicket } from './ticket.server';
import { getUserById } from './user.server';
import stripe from '../utils/stripe.server';

export async function createAccount(body: Stripe.AccountCreateParams) {
  const account = await stripe.accounts.create(body);
  return account;
}

export async function retrieveAccount(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return account;
}

// async function deleteAccount(accountId: string) {
//   const account = await stripe.accounts.del(accountId);
//   return account;
// }

export async function createAccountLink({
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

// export async function createUpdateAccountLink({
//   refreshUrl,
//   returnUrl,
//   account,
// }: {
//   refreshUrl: string;
//   returnUrl: string;
//   account: string;
// }) {
//   const accountLink = await stripe.accountLinks.create({
//     account,
//     refresh_url: refreshUrl,
//     return_url: returnUrl,
//     type: 'account_update',
//   });
//   return accountLink;
// }

// async function createLoginLink(accountId: string) {
//   const loginLink = await stripe.accounts.createLoginLink(accountId);
//   return loginLink;
// }

// async function createPaymentIntent({
//   amount,
//   accountId,
// }: {
//   amount: number;
//   accountId?: string;
// }) {
//   const paymentIntent = await stripe.paymentIntents.create(
//     {
//       amount,
//       currency: 'usd',
//       payment_method_types: ['card'],
//       automatic_payment_methods: { enabled: true },
//       confirm: true,
//     },
//     {
//       stripeAccount: accountId,
//     }
//   );
//   return paymentIntent;
// }

export async function transfer({
  amount,
  destination,
  description,
  chargeId,
}: {
  amount: number;
  destination: string;
  description: string;
  chargeId: string;
}) {
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'usd',
    destination,
    source_transaction: chargeId,
    description,
  });
  return transfer;
}

export async function retrieveCharge(chargeId: string) {
  const charge = await stripe.charges.retrieve(chargeId);
  return charge;
}

export async function createRefund({
  chargeId,
  paymentIntentId,
  reverseTransfer,
}: {
  chargeId?: string;
  paymentIntentId?: string;
  reverseTransfer: boolean;
}) {
  const refund = await stripe.refunds.create({
    charge: chargeId,
    payment_intent: paymentIntentId,
    reverse_transfer: reverseTransfer,
  });
  return refund;
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
}

export async function createLoginLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink;
}

export async function createCheckoutSession({
  buyerUserId,
  successUrl,
  cancelUrl,
  ticketId,
}: {
  buyerUserId: string;
  successUrl: string;
  cancelUrl: string;
  ticketId: string;
}) {
  const ticket = await (await getTicket({ id: ticketId })).json();
  console.log('ticket', ticket);
  invariant(ticket, 'Ticket not found');
  const buyerUser = await (await getUserById({ id: buyerUserId })).json();
  console.log('buyerUser', buyerUser);
  invariant(buyerUser, 'User not found');
  const sellerUser = await (
    await getUserById({ id: ticket.sellerUserId })
  ).json();
  console.log('sellerUser', sellerUser);
  invariant(sellerUser, 'User not found');
  if (!sellerUser.stripeAccountId)
    return await stripe.checkout.sessions.create({
      mode: 'payment',
      automatic_tax: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'exclusive',
            product_data: {
              name: ticket.title,
            },
            unit_amount: Math.round(
              (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
            ),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'inclusive',
            product_data: {
              name: 'Stripe Fee',
            },
            unit_amount:
              30 +
              Math.round(
                (Math.round((ticket.price + Number.EPSILON) * 100) / 100) *
                  0.034 *
                  100
              ),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'inclusive',
            product_data: {
              name: 'Bloompass Fee',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ticketId,
        buyerUserId,
        sellerUserId: ticket.sellerUserId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  else
    return await stripe.checkout.sessions.create({
      mode: 'payment',
      automatic_tax: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'exclusive',
            product_data: {
              name: ticket.title,
            },
            unit_amount: Math.round(
              (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
            ),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'inclusive',
            product_data: {
              name: 'Stripe Fee',
            },
            unit_amount:
              30 +
              Math.round(
                (Math.round((ticket.price + Number.EPSILON) * 100) / 100) *
                  0.034 *
                  100
              ),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            tax_behavior: 'inclusive',
            product_data: {
              name: 'Bloompass Fee',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ticketId,
        buyerUserId,
        sellerUserId: ticket.sellerUserId,
      },
      payment_intent_data: {
        transfer_data: {
          destination: sellerUser.stripeAccountId,
          amount: Math.round(
            (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
          ),
        },
        transfer_group: ticket.id,
        statement_descriptor: `Bloompass ${ticket.title.substring(0, 12)}`,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

export async function retrieveBalance({
  accountId,
}: {
  accountId: string | undefined;
}) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });
  return balance;
}

export async function payout({
  accountId,
  name,
}: {
  accountId: string;
  name: string;
}) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  const { amount, currency } = balance.available[0];

  const payout = await stripe.payouts.create(
    {
      amount,
      currency,
      statement_descriptor: `Bloompass ${name.substring(0, 12)}`,
    },
    {
      stripeAccount: accountId,
    }
  );

  return payout;
}
