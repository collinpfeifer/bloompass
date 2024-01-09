import {
  LoaderFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { requireUser } from '../session.server';
import { getSellingTicketsByUserId } from '../models/ticket.server';
import { Box, Stack } from '@mantine/core';
import { Ticket } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import HeaderUser from '../components/headeruser';
import TicketCard from '../components/ticketcard';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  if (!user?.id) return redirect('/login?redirect=/tickets/selling');
  const tickets = await (
    await getSellingTicketsByUserId({ userId: user?.id })
  ).json();
  return json({ user, tickets });
};

export default function TicketsSelling() {
  const { user, tickets } = useLoaderData<typeof loader>();
  return (
    <>
      <HeaderUser user={user} />
      <Box miw='70%' mih='78.5dvh'>
        <Stack>
          {/* <Form method='post'>
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
          </Form> */}
          <Box m='auto'>
            {tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  dateTime={ticket.dateTime}
                  price={ticket.price}
                  sellerUserId={ticket.sellerUserId}
                  userId={user?.id}
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
