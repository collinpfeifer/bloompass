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
  console.log('sellerUser.stripeAccountId', sellerUser.stripeAccountId);
  invariant(
    sellerUser.stripeAccountId,
    'Seller does not have a Stripe account'
  );

  return await stripe.checkout.sessions.create({
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
          unit_amount: Math.round(
            (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
          ),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
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
    // payment_intent_data: {
    //   transfer_data: {
    //     destination: sellerUser.stripeAccountId,
    //     amount: Math.round(
    //       (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
    //     ),
    //   },
    // },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
}

// async function payout(accountId: string) {
//   const balance = await stripe.balance.retrieve({
//     stripeAccount: accountId,
//   });

//   const { amount, currency } = balance.available[0];

//   const payout = await stripe.payouts.create(
//     {
//       amount,
//       currency,
//       statement_descriptor: 'Bloompass Payout',
//     },
//     {
//       stripeAccount: accountId,
//     }
//   );

//   return payout;
// }
