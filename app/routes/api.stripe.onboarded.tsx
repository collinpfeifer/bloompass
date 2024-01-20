import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { retrieveAccount, transfer } from '../models/stripe.server';
import { updateUser } from '../models/user.server';
import { getUser } from '../session.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = searchParams.get('redirectTo');
  if (user && user.stripeAccountId) {
    const data = await retrieveAccount(user?.stripeAccountId);
    if (data.details_submitted) {
      await updateUser({ id: user.id, onboardingComplete: true });
      // if (user?.balance > 0) {
      //   await transfer({
      //     amount: user.balance,
      //     destination: user.stripeAccountId,
      //     description: 'Balance transfer',
      //   });
      //   await updateUser({ id: user.id, balance: 0 });
      // }
      return redirect(redirectTo || '/profile');
    } else {
      return redirect('/login');
    }
  } else {
    return redirect('/login');
  }
};
