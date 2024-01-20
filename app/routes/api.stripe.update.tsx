import { LoaderFunction, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getUser } from '../session.server';
import { createAccountLink } from '../models/stripe.server';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = searchParams.get('redirectTo');
  const user = await getUser(request);
  if (!user?.onboardingComplete) return redirect(redirectTo || '/profile');
  if (user && !user?.stripeAccountId) {
    return redirect('/api/stripe/authorize');
  }
  if (user?.stripeAccountId) {
    const accountUpdateLink = await createAccountLink({
      account: user?.stripeAccountId,
      refreshUrl: `${process.env.BASE_URL}/api/stripe/update`,
      returnUrl: `${process.env.BASE_URL}/profile`,
    });
    return redirect(accountUpdateLink.url);
  }
  return redirect('/profile');
};
