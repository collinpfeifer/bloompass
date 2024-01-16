import { ActionFunction, ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { z } from 'zod';
import { deleteTicket } from '../models/ticket.server';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const deleteTicketSchema = z.object({
    ticketId: z.string(),
  });
  const result = deleteTicketSchema.safeParse(formData);
  if (!result.success) return json({ errors: result.error.issues[0].message });
  const { ticketId } = result.data;
  await deleteTicket({ id: ticketId });
  return redirect('/feed');
};
