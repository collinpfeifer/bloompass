import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  retrieveAccount,
  retrieveCharge,
  transfer,
} from '../models/stripe.server';
import { updateUser } from '../models/user.server';
import { getUser } from '../session.server';
import { getSellingTicketsByUserId } from '~/models/ticket.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = searchParams.get('redirectTo');
  if (user && user.stripeAccountId) {
    const data = await retrieveAccount(user?.stripeAccountId);
    if (data.details_submitted && data?.capabilities?.transfers === 'active') {
      await updateUser({ id: user.id, onboardingComplete: true });
      for (const ticket of await (
        await getSellingTicketsByUserId({ userId: user.id })
      ).json()) {
        if (ticket.sold && ticket.chargeId) {
          await transfer({
            amount: ticket.price * 100,
            destination: ticket.sellerUserId,
            description: `Ticket sale: ${ticket.title}`,
            chargeId: ticket.chargeId,
          });
        }
      }
      return redirect(redirectTo || '/profile');
    } else {
      return redirect('/profile');
    }
  } else {
    return redirect('/profile');
  }
};
