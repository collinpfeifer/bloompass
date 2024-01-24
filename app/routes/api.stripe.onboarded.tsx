import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import {
  retrieveAccount,
  transfer,
} from '../models/stripe.server';
import { updateUser } from '../models/user.server';
import { getUser } from '../session.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = searchParams.get('redirectTo');
  if (user && user.stripeAccountId) {
    const data = await retrieveAccount(user?.stripeAccountId);
    if (
      data.details_submitted &&
      data?.capabilities?.transfers === 'active' &&
      data?.capabilities?.card_payments === 'active'
    ) {
      await updateUser({ id: user.id, onboardingComplete: true });
      if (user?.pendingChargeIds?.length > 0) {
        for (const charge in user.pendingChargeIds) {
          await transfer({
            description: 'Ticket sale',
            chargeId: charge,
            destination: user.stripeAccountId,
          });
        }
        await updateUser({ id: user.id, pendingChargeIds: [] });
      }
      return redirect(redirectTo || '/profile');
    } else {
      return redirect('/profile');
    }
  } else {
    return redirect('/profile');
  }
};
