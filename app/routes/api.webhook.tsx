import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import stripe from '../utils/stripe.server';
import invariant from 'tiny-invariant';
import { getTicket, updateTicket } from '../models/ticket.server';
import { getUserById } from '../models/user.server';

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
          });
          console.log('💰 refund success!');
        } else {
          const sellerUser = await (
            await getUserById({ id: sellerUserId })
          ).json();
          invariant(sellerUser, 'No seller user');
          invariant(sellerUser.stripeAccountId, 'No seller stripe account id');
          await stripe.transfers.create({
            amount: Math.round(
              (Math.round((ticket.price + Number.EPSILON) * 100) / 100) * 100
            ),
            currency: 'usd',
            destination: sellerUser.stripeAccountId,
          });
          await (
            await updateTicket({
              id: ticketId,
              title: undefined,
              description: undefined,
              buyerUserId,
              sold: true,
              soldAt: new Date().toISOString(),
              hashtags: undefined,
              newHashtags: undefined,
            })
          ).json();
          console.log('💰 payment success!');
        }
      }
    }
  }

  return {};
};
