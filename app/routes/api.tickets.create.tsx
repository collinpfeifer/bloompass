import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { z } from 'zod';
import { createTicket } from '../models/ticket.server';
import { requireUser } from '../session.server';

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const user = await requireUser(request);
  if (!user) return redirect('/login');
  const formData = Object.fromEntries(await request.formData());

  const stringToJSONSchema = z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  });

  const createTicketSchema = z.object({
    title: z.string().min(1).max(50),
    description: z
      .union([z.string().length(0), z.string().min(1), z.string().max(500)])
      .optional(),
    dateTime: z.string().transform((val) => new Date(val).toISOString()),
    price: z
      .string()
      .transform((val) => Number(val))
      .refine((val) => val > 0),
    link: z.string().url(),
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

  const result = createTicketSchema.safeParse(formData);
  if (!result.success)
    return json({
      ticket: null,
      errors: {
        title: result.error.issues[0].message,
        description: result.error.issues[0].message,
        dateTime: result.error.issues[0].message,
        price: result.error.issues[0].message,
        link: result.error.issues[0].message,
        hashtags: result.error.issues[0].message,
        newHashtags: result.error.issues[0].message,
      },
    });

  const { title, description, dateTime, price, link, hashtags, newHashtags } =
    result.data;

  try {
    const newTicket = await (
      await createTicket({
        request,
        title,
        description,
        dateTime,
        price,
        link,
        hashtags,
        newHashtags,
      })
    ).json();
    // return redirect(`/tickets/${newTicket.id}`);
    return json({ ticket: newTicket, errors: null });
  } catch (e: any) {
    return json({
      ticket: null,
      errors: {
        title: e.message,
        description: e.message,
        dateTime: e.message,
        price: e.message,
        link: e.message,
        hashtags: e.message,
        newHashtags: e.message,
      },
    });
  }
};
