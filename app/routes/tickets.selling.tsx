import {
  LoaderFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { requireUser } from '../session.server';
import { getSellingTicketsByUserId } from '../models/ticket.server';
import { Box, Stack, Title, Text, Flex } from '@mantine/core';
import { Ticket } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';
import HeaderUser from '../components/headeruser';
import TicketCard from '../components/ticketcard';
import { getHashtags } from '../models/hashtag.server';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  if (!user?.id) return redirect('/login?redirectTo=/tickets/selling');
  const tickets = await (
    await getSellingTicketsByUserId({ userId: user?.id })
  ).json();
  const allHashtags = await (await getHashtags()).json();
  return json({ user, tickets, hashtags: allHashtags });
};

export default function TicketsSelling() {
  const { user, tickets, hashtags } = useLoaderData<typeof loader>();
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
            <Title c='white'>Your Sold/Selling Tickets</Title>
            {tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  dateTime={ticket.dateTime}
                  price={ticket.price}
                  sold={ticket.sold}
                  link={ticket.link}
                  sellerUserId={ticket.sellerUserId}
                  buyerUserId={ticket.buyerUserId}
                  userId={user?.id}
                  hashtags={ticket.hashtags}
                  allHashtags={hashtags}
                />
              ))
            ) : (
              <Flex justify='center'>
                <Text c='white' fw='bold' m='auto'>
                  No tickets selling/sold
                </Text>
              </Flex>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
}
