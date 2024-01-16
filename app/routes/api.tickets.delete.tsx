import { ActionFunction, ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod';
import { deleteTicket } from '../models/ticket.server';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const deleteTicketSchema = z.object({
    ticketId: z.string(),
  });
  const result = deleteTicketSchema.safeParse(formData)
  if (!result.success)
    return json({ success: false, errors: result.error.issues[0].message });
  const { ticketId } = result.data;
  const ticket = await deleteTicket({ id: ticketId });
  if (!ticket) return json({ success: false, errors: 'Ticket not found' });
  return json({ success: true, errors: null });
};
