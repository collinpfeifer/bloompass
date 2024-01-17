import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import resend from '../utils/resend.server';
import { z } from 'zod';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const reportSchema = z.object({
    reason: z.string(),
    refund: z.string(),
    message: z.string(),
    ticketId: z.string(),
    userId: z.string(),
    sellerUserId: z.string(),
    buyerUserId: z.string(),
  });
  const result = reportSchema.safeParse(formData);
  if (!result.success)
    return json({ success: false, errors: result.error.issues[0].message });
  const {
    reason,
    refund,
    message,
    ticketId,
    userId,
    sellerUserId,
    buyerUserId,
  } = result.data;

  const { error } = await resend.emails.send({
    from: 'info@bloompass.io',
    to: ['cpfeifer@madcactus.org'],
    subject: 'Report/Refund Request',
    html: `<p>Reason: ${reason}</p><p>Refund: ${
      refund === 'on'
    }</p><p>Message: ${message}</p> <p>Ticket ID: ${ticketId}</p> <p>User ID: ${userId}</p> <p>Seller User ID: ${sellerUserId}</p> <p> Buyer User ID: ${buyerUserId}</p>`,
  });
  if (error) return json({ success: false, errors: error.message });
  return json({ success: true, errors: null });
};
