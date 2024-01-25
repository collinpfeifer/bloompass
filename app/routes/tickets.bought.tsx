import {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from '@remix-run/node';
import { requireUser } from '../session.server';
import { getBoughtTicketsByUserId } from '../models/ticket.server';
import invariant from 'tiny-invariant';
import HeaderUser from '../components/headeruser';
import { Box, Stack, Title, Text, Flex } from '@mantine/core';
import { Ticket } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import TicketCard from '../components/ticketcard';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  invariant(user?.id, 'User must be logged in to view this page');
  const tickets = await (
    await getBoughtTicketsByUserId({ userId: user?.id })
  ).json();
  return json({ user, tickets });
};

export const meta: MetaFunction = () => [{ title: 'Bought Tickets' }];

export default function TicketsBought() {
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
            <Title c='white'>Your Bought Tickets</Title>
            {tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  dateTime={ticket.dateTime}
                  price={Number(ticket.price)}
                  sold={ticket.sold}
                  link={ticket.link}
                  sellerUserId={ticket.sellerUserId}
                  buyerUserId={ticket.buyerUserId}
                  userId={user?.id}
                  hashtags={ticket.hashtags}
                />
              ))
            ) : (
              <Flex justify='center'>
                <Text c='white' fw='bold'>
                  No tickets bought
                </Text>
              </Flex>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
}
