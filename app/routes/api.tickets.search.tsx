import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';
import { searchTickets } from '../models/ticket.server';
import { z } from 'zod';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const searchSchema = z.object({
    query: z.string().min(1).max(500),
  });
  const { query } = searchSchema.parse(formData);
  return await searchTickets({ query });
};
