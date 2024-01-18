import {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { getTicket } from '../models/ticket.server';
import TicketCard from '../components/ticketcard';
import { useLoaderData } from '@remix-run/react';
import { getUser } from '../session.server';
import {
  Flex,
  CopyButton,
  Tooltip,
  ActionIcon,
  Text,
  Box,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import HeaderUser from '../components/headeruser';
import { getHashtags } from '../models/hashtag.server';

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const user = await getUser(request);
  console.log(user);
  const id = params.ticketId;
  console.log(id);
  if (!id) return redirect('/feed');
  const ticket = await (await getTicket({ id })).json();
  const allHashtags = await (await getHashtags()).json();
  return json({
    baseUrl: process.env.BASE_URL,
    user,
    ticket,
    hashtags: allHashtags,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data.ticket.title },
];

export default function Ticket() {
  const { user, ticket, baseUrl, hashtags } = useLoaderData<typeof loader>();
  return (
    <>
      <HeaderUser user={user} />
      <Box mih='78.5dvh' maw={350}>
        <TicketCard
          key={ticket.id}
          id={ticket.id}
          title={ticket.title}
          description={ticket.description}
          dateTime={ticket.dateTime}
          link={ticket.link}
          price={ticket.price}
          sold={ticket.sold}
          sellerUserId={ticket.sellerUserId}
          buyerUserId={ticket.buyerUserId}
          userId={user?.id}
          hashtags={ticket.hashtags}
          allHashtags={hashtags}
        />
        {user && user.id === ticket.sellerUserId && (
          <>
            <Text fw='bold' c='white'>
              Share your Ticket to Sell Faster! 🏃🥳
            </Text>
            <Flex
              bg='gray'
              wrap='nowrap'
              m={1}
              p={2}
              justify='space-between'
              maw={350}>
              <Text c='white ' m={3} lineClamp={1}>
                {`${baseUrl}/tickets/${ticket.id}`}
              </Text>
              <CopyButton
                value={`${baseUrl}/tickets/${ticket.id}`}
                timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? 'Copied' : 'Copy'}
                    withArrow
                    position='right'>
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? (
                        <IconCheck size='1rem' />
                      ) : (
                        <IconCopy size='1rem' />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Flex>
          </>
        )}
      </Box>
    </>
  );
}
