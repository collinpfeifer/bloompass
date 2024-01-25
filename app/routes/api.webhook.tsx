import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import stripe from '../utils/stripe.server';
import { createRefund, retrievePaymentIntent } from '../models/stripe.server';
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
  } catch (err: any) {
    return new Response(err.message, {
      status: 400,
    });
  }
  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object;
    if (checkoutSession.metadata) {
      const { ticketId, buyerUserId, sellerUserId } = checkoutSession.metadata;
      invariant(
        typeof checkoutSession.payment_intent === 'string',
        'No payment intent'
      );
      const paymentIntent = await retrievePaymentIntent(
        checkoutSession.payment_intent
      );
      const ticket = await (await getTicket({ id: ticketId })).json();
      if (ticket) {
        invariant(
          typeof paymentIntent.latest_charge === 'string',
          'No latest charge'
        );
        if (ticket.sold) {
          const sellerUser = await (
            await getUserById({ id: sellerUserId })
          ).json();
          if (sellerUser) {
            await createRefund({
              chargeId: paymentIntent.latest_charge,
              reverseTransfer: sellerUser.onboardingComplete,
            });
            console.log('💰 refund success!');
          } else {
            await createRefund({
              chargeId: paymentIntent.latest_charge,
              reverseTransfer: false,
            });
            console.log('💰 refund possible success!');
          }
        } else {
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
              chargeId: paymentIntent.latest_charge,
              dateTime: undefined,
              newHashtags: [],
              removedHashtags: [],
            })
          ).json();
          console.log('💰 payment success!');
        }
      }
    }
  }
  return {};
};
