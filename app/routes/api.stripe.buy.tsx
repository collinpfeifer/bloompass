import { redirect, json, ActionFunctionArgs } from '@remix-run/node';
import { z } from 'zod';
import { createCheckoutSession } from '../models/stripe.server';
import invariant from 'tiny-invariant';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const buySchema = z.object({
    ticketId: z.string(),
    buyerUserId: z.string(),
  });
  console.log(formData);
  const result = buySchema.safeParse(formData);
  if (!result.success) return json({ errors: result.error.issues[0].message });
  const { ticketId, buyerUserId } = result.data;
  const session = await createCheckoutSession({
    ticketId,
    buyerUserId,
    successUrl: `${process.env.BASE_URL}/api/stripe/checkoutsuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.BASE_URL}/feed`,
  });
  console.log(session)
  invariant(session.url, 'Session URL not created');
  return redirect(session.url);
};