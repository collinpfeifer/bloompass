import { ActionFunction, ActionFunctionArgs, json } from '@remix-run/node';
import { z } from 'zod';
import { updateTicket } from '../models/ticket.server';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  console.log(formData);

  const stringToJSONSchema = z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  });

  const editTicketSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(50),
    description: z
      .union([z.string().length(0), z.string().min(1), z.string().max(500)])
      .optional(),
    dateTime: z.string().transform((val) => new Date(val).toISOString()),
    price: z
      .string()
      .transform((val) => Number(val))
      .refine((val) => val > 0),
    hashtags: stringToJSONSchema.pipe(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          createdAt: z.string().transform((val) => new Date(val).toISOString()),
          updatedAt: z.string().transform((val) => new Date(val).toISOString()),
        })
      )
    ),
    newHashtags: stringToJSONSchema.pipe(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          createdAt: z.string().transform((val) => new Date(val).toISOString()),
          updatedAt: z.string().transform((val) => new Date(val).toISOString()),
        })
      )
    ),
  });

  const result = editTicketSchema.safeParse(formData);

  if (!result.success) {
    return json({
      ticket: null,
      errors: {
        title: result.error.issues[0].message,
        description: result.error.issues[0].message,
        dateTime: result.error.issues[0].message,
        price: result.error.issues[0].message,
        hashtags: result.error.issues[0].message,
        newHashtags: result.error.issues[0].message,
      },
    });
  }

  const { id, title, description, dateTime, price, hashtags, newHashtags } =
    result.data;

  const newTicket = await (
    await updateTicket({
      id,
      title,
      description,
      dateTime,
      price,
      hashtags,
      newHashtags,
    })
  ).json();
  // return redirect(`/tickets/${newTicket.id}`);
  return json({ ticket: newTicket, errors: null });
};
