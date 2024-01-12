import { redirect, json, ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { createCheckoutSession } from '../models/stripe.server';
import invariant from 'tiny-invariant';
import { getTicket } from '../models/ticket.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const buySchema = z.object({
    ticketId: z.string(),
    buyerUserId: z.string(),
  });
  const result = buySchema.safeParse(formData);
  if (!result.success) return json({ errors: result.error.issues[0].message });
  const { ticketId, buyerUserId } = result.data;
  const ticket = await (await getTicket({ id: ticketId })).json();
  if (!ticket) return json({ errors: 'Ticket not found' });
  if (ticket.sold) return json({ errors: 'Ticket already sold' });
  const session = await createCheckoutSession({
    ticketId,
    buyerUserId,
    successUrl: `${process.env.BASE_URL}/api/stripe/checkoutsuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.BASE_URL}/feed`,
  });
  invariant(session.url, 'Session URL not created');
  return redirect(session.url);
};
