import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import stripe from '../utils/stripe.server';
import { createRefund, retrievePaymentIntent } from '../models/stripe.server';
import invariant from 'tiny-invariant';
import { getTicket, updateTicket } from '../models/ticket.server';
import { getUserById, updateUser } from '../models/user.server';

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
        if (ticket.sold) {
          invariant(
            typeof paymentIntent.latest_charge === 'string',
            'No latest charge'
          );
          await createRefund({
            chargeId: paymentIntent.latest_charge,
            paymentIntentId: checkoutSession.payment_intent,
            reverseTransfer: true,
          });
          console.log('💰 refund success!');
        } else {
          const sellerUser = await (
            await getUserById({ id: sellerUserId })
          ).json();
          if (sellerUser && !sellerUser?.onboardingComplete) {
            invariant(
              typeof paymentIntent.latest_charge === 'string',
              'No latest charge'
            );
            await updateUser({
              id: sellerUserId,
              pendingChargeIds: [
                ...sellerUser.pendingChargeIds,
                paymentIntent.latest_charge,
              ],
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
    // } else if (event.type === 'balance.available') {
    //   const balance = event.data.object;
    //   console.log('💰 balance available!', balance);
    //   const users = await (await getUsers()).json();
    //   try {
    //     for (const user of users) {
    //       if (
    //         user?.balance > 0 &&
    //         balance.available[0].amount / 100 >= user?.balance &&
    //         user.stripeAccountId
    //       ) {
    //         await transfer({
    //           amount: user.balance,
    //           destination: user.stripeAccountId,
    //           description: 'Balance transfer',
    //         });
    //         await updateUser({ id: user.id, balance: 0 });
    //       }
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }

    return {};
  }
};
