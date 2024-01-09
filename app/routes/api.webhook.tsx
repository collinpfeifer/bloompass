import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import stripe from '../utils/stripe.server';
import invariant from 'tiny-invariant';
import { updateTicket } from '../models/ticket.server';

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

  if (event.type == 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { ticketId, buyerUserId } = paymentIntent.metadata;
    const ticket = await (
      await updateTicket({
        id: ticketId,
        title: undefined,
        description: undefined,
        buyerUserId,
        hashtags: undefined,
        newHashtags: undefined,
      })
    ).json();
    console.log('💰 payment success!');
  }

  return {};
};
