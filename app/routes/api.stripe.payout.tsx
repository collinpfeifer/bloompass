import { ActionFunction, json } from '@remix-run/node';
import { payout } from '../models/stripe.server';
import { getUser } from '../session.server';

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  try {
    const payoutResponse = await payout({
      accountId: user?.stripeAccountId,
      name: 'Ticket Payout',
    });
    //   console.log(payoutResponse);
    return json({ payout: payoutResponse, error: null });
  } catch (error) {
    console.log(error);
    return json({ payout: null, error });
  }
};
