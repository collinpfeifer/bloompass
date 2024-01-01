import {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  json,
} from '@remix-run/node';
import { requireUser } from '../session.server';
import { createTicket, getTickets } from '../models/ticket.server';
import { Form, useLoaderData } from '@remix-run/react';
import { Stack, Button, TextInput } from '@mantine/core';
import { getHashtags } from '../models/hashtag.server';
import type { Ticket } from '@prisma/client';
import { z } from 'zod';
import TicketCard from '../components/ticketcard';
import HeaderUser from '../components/headeruser';
import { useForm } from '@mantine/form';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  const tickets = await (await getTickets()).json();
  const hashtags = await (await getHashtags()).json();
  return json({ tickets, hashtags, user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
    description: z.string().min(1).max(500),
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
  console.log(newTicket);
  return json({});
};

export default function Feed() {
  const { tickets, hashtags, user } = useLoaderData<typeof loader>();

  const form = useForm({
    initialValues: {
      query: '',
    },
  });

  // limit tickets to 30 of the most recently created / closest to starting / cheapest

  // search will return all tickets that match the query sorted descending from the starting time
  // hashtags will work the same way, but will only return tickets that have the hashtag

  return (
    <>
      <HeaderUser hashtags={hashtags} user={user} />
      <Stack>
        <Form method='post' action=''>
          <TextInput {...form.getInputProps('query')} />
        </Form>
        {tickets.map((ticket: Ticket) => (
          <TicketCard
            key={ticket.id}
            title={ticket.title}
            description={ticket.description}
            dateTime={ticket.dateTime}
            price={ticket.price}
            hashtags={ticket.hashtags}
          />
        ))}
      </Stack>
    </>
  );
}
