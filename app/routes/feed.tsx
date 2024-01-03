import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { getUser } from '../session.server';
import { getTickets, searchTicketsByQuery } from '../models/ticket.server';
import { Form, useLoaderData } from '@remix-run/react';
import { Box, Button, Group, Stack, TextInput } from '@mantine/core';
import { getHashtags } from '../models/hashtag.server';
import type { Ticket } from '@prisma/client';
import TicketCard from '../components/ticketcard';
import HeaderUser from '../components/headeruser';
import { z } from 'zod';
import { useForm } from '@mantine/form';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const user = await getUser(request);
  const allHashtags = await (await getHashtags()).json();
  if (query)
    return json({
      hashtags: allHashtags,
      user,
      tickets: await (await searchTicketsByQuery({ query })).json(),
    });
  else
    return json({
      user,
      hashtags: allHashtags,
      tickets: await (await getTickets()).json(),
    });
};

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  console.log('form', formData);
  const searchSchema = z.object({
    query: z.string().min(1).max(500),
  });
  const { query } = searchSchema.parse(formData);
  return redirect(`/feed?q=${query}`);
};

export default function Feed() {
  const { tickets, hashtags, user } = useLoaderData<typeof loader>();

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      query: '',
    },
    validate: {
      query: (val) => {
        if (val.length < 1) return 'Search query must be at least 1 character';
        if (val.length > 500)
          return 'Search query must be less than 500 characters';
        return false;
      },
    },
  });

  // limit tickets to 30 of the most recently created / closest to starting / cheapest

  // search will return all tickets that match the query sorted descending from the starting time
  // hashtags will work the same way, but will only return tickets that have the hashtag

  return (
    <>
      <HeaderUser hashtags={hashtags} user={user} />
      <Box miw='70%' mih='78.5dvh'>
        <Stack>
          <Form method='post'>
            <Group>
              <TextInput
                name='query'
                placeholder='Search for tickets and hashtags'
                w='80%'
                {...form.getInputProps('query')}
              />
              <Button disabled={form.values.query.length < 2} type='submit'>
                Search
              </Button>
              <Button>Clear</Button>
            </Group>
          </Form>
          <Box m='auto'>
            {tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  dateTime={ticket.dateTime}
                  price={ticket.price}
                  hashtags={ticket.hashtags}
                />
              ))
            ) : (
              <p>No tickets found</p>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
}
