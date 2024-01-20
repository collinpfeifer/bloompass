import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import stripe from '../utils/stripe.server';
import invariant from 'tiny-invariant';
import { getTicket, updateTicket } from '../models/ticket.server';
import { getUserById, getUsers, updateUser } from '../models/user.server';
import { transfer } from '../models/stripe.server';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const secret = process.env.ENDPOINT_SECRET;
  const sig = request.headers.get('stripe-signature');
  invariant(sig, 'No signature');
  invariant(secret, 'No secret');
  let event;
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return new Response(err.message, {
      status: 400,
    });
  }
  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;
    if (checkoutSession.metadata) {
      const { ticketId, buyerUserId, sellerUserId } = checkoutSession.metadata;
      const ticket = await (await getTicket({ id: ticketId })).json();
      if (ticket) {
        if (ticket.sold) {
          await stripe.refunds.create({
            payment_intent: checkoutSession.payment_intent,
            reverse_transfer: true,
          });
          console.log('💰 refund success!');
        } else {
          const sellerUser = await (
            await getUserById({ id: sellerUserId })
          ).json();
          if (sellerUser && !sellerUser?.stripeAccountId) {
            await updateUser({
              id: sellerUserId,
              balance: sellerUser?.balance + ticket.price,
            });
          }
          await (
            await updateTicket({
              id: ticketId,
              title: undefined,
              description: undefined,
              buyerUserId,
              sold: true,
              soldAt: new Date().toISOString(),
              hashtags: [],
              price: undefined,
              dateTime: undefined,
              newHashtags: [],
              removedHashtags: [],
            })
          ).json();
          console.log('💰 payment success!');
        }
      }
    }
  } else if (event.type === 'balance.available') {
    const balance = event.data.object;
    const users = await (await getUsers()).json();
    for (const user of users) {
      if (
        user?.balance > 0 &&
        balance.available[0].amount / 100 >= user?.balance
      ) {
        await transfer({
          amount: user.balance,
          destination: user.stripeAccountId,
          description: 'Balance transfer',
        });
        await updateUser({ id: user.id, balance: 0 });
      }
    }
  }

  return {};
};
