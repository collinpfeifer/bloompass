import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { retrieveCheckoutSession } from '../models/stripe.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const params = new URLSearchParams(request.url.split('?')[1]);
  const sessionId = params.get('session_id');
  if (!sessionId) throw new Error('No session id provided');
  const session = await retrieveCheckoutSession(sessionId);
  if (session.url)
    if (session.payment_status === 'paid') {
      return redirect(`${process.env.BASE_URL}/tickets/bought`);
    } else return redirect(session.url);
  return json({});
};
