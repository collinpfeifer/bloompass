import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { createAccount, createAccountLink } from '../models/stripe.server';
import { getUser } from '../session.server';
import { updateUser } from '../models/user.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = searchParams.get('redirectTo');
  const user = await getUser(request);
  if (user?.onboardingComplete) return redirect(redirectTo || '/feed');
  let accountId = user?.stripeAccountId;
  if (user && !accountId) {
    const account = await createAccount({
      type: 'express',
      country: 'US',
      default_currency: 'usd',
      email: user.email,
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      business_type: 'individual',
      individual: {
        email: user.email,
      },
      business_profile: {
        product_description: 'Ticket reseller',
        support_email: user.email,
        // url: `${process.env.BASE_URL}/users/${user.id}`,
      },
    });
    accountId = account.id;
    await updateUser({ id: user.id, stripeAccountId: accountId });
  }
  if (accountId) {
    const accountLink = await createAccountLink({
      account: accountId,
      refreshUrl: `${process.env.BASE_URL}/api/stripe/authorize`,
      returnUrl: `${process.env.BASE_URL}/api/stripe/onboarded${
        redirectTo ? `?redirectTo=${redirectTo}` : ''
      }`,
    });
    return redirect(accountLink.url);
  }
  return redirect('/feed');
};
