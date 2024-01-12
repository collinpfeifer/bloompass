import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { retrieveCheckoutSession } from '../models/stripe.server';
import invariant from 'tiny-invariant';
import { getTicket } from '../models/ticket.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const params = new URLSearchParams(request.url.split('?')[1]);
  const sessionId = params.get('session_id');
  if (!sessionId) throw new Error('No session id provided');
  const session = await retrieveCheckoutSession(sessionId);
  const { buyerUserId, ticketId } = session.metadata;
  const ticket = await (await getTicket({ id: ticketId })).json();
  if (!ticket) throw new Error('No ticket found');
  invariant(session.cancel_url, 'No cancel url');
  if (session.payment_status === 'paid') {
    if (ticket.buyerUserId === buyerUserId)
      return redirect(`${process.env.BASE_URL}/tickets/bought`);
    else
      return redirect(
        `${process.env.BASE_URL}/tickets/alreadysold/${ticketId}`
      );
  } else return redirect(session.cancel_url);
};
