import {
  LoaderFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { getTicket } from '../models/ticket.server';
import TicketCard from '../components/ticketcard';
import { useLoaderData } from '@remix-run/react';
import { getUser } from '../session.server';
import { Flex, CopyButton, Tooltip, ActionIcon, Text } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import Footer from '../components/footer';

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const id = params.id;
  if (!id) return redirect('/feed');
  const ticket = await (await getTicket({ id })).json();
  return json({ baseUrl: process.env.BASE_URL, user, ticket });
};

export default function Ticket() {
  const { user, ticket, baseUrl } = useLoaderData<typeof loader>();
  return (
    <>
      <TicketCard
        key={ticket.id}
        id={ticket.id}
        title={ticket.title}
        description={ticket.description}
        dateTime={ticket.dateTime}
        link={ticket.link}
        price={ticket.price}
        sellerUserId={ticket.sellerUserId}
        buyerUserId={ticket.buyerUserId}
        userId={user?.id}
        hashtags={ticket.hashtags}
      />

      <Flex
        bg='gray'
        wrap='nowrap'
        m={1}
        p={2}
        justify='space-between'
        maw={350}>
        <Text m={3} lineClamp={1}>
          {`${baseUrl}/tickets/${ticket.id}`}
        </Text>
        <CopyButton value={`${baseUrl}/tickets/${ticket.id}`} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? 'Copied' : 'Copy'}
              withArrow
              position='right'>
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                {copied ? <IconCheck size='1rem' /> : <IconCopy size='1rem' />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Flex>
    </>
  );
}
