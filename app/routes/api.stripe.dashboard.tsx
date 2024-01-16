import { ActionFunction, ActionFunctionArgs, redirect } from '@remix-run/node';
import { getUser } from '../session.server';
import { createLoginLink } from '../models/stripe.server';
import invariant from 'tiny-invariant';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const user = await getUser(request);
  if (!user?.onboardingComplete) return redirect('/api/stripe/authorize');
  invariant(user?.stripeAccountId, 'Stripe account not found');
  const accountLink = await createLoginLink(user?.stripeAccountId)
  return redirect(accountLink.url);
};
