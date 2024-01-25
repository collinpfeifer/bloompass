import {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { getTicket } from '../models/ticket.server';
import { Link, useLoaderData } from '@remix-run/react';
import { Title, Group, Button, Container, Text } from '@mantine/core';
import classes from '../styles/notfound.module.css';
import { formatTimeDifference } from '../utils/formatTimeDifference';

export const loader: LoaderFunction = async ({
  params,
}: LoaderFunctionArgs) => {
  const ticketId = params.ticketId;
  if (!ticketId) return redirect('/feed');
  const ticket = await (await getTicket({ id: ticketId })).json();
  if (!ticket) return redirect('/feed');
  if (!ticket.sold) return redirect(`/tickets/${ticketId}`);
  return json({ ticket });
};

export const meta: MetaFunction = () => [{ title: 'Ticket already sold!' }];

export default function AlreadySold() {
  const { ticket } = useLoaderData<typeof loader>();
  return (
    <Container className={classes.root}>
      <div className={classes.label}>Aw you just missed it! 😔</div>
      <Title className={classes.title}>
        Someone bought this ticket before you did. Don&apos;t worry, we refunded
        it to your account.
      </Title>
      <Text size='lg' ta='center' className={classes.description}>
        More specifically, this ticket was bought{' '}
        <span style={{ fontWeight: 'bold' }}>
          {formatTimeDifference(Date.parse(ticket.soldAt), Date.now())}
        </span>{' '}
        ago. Better luck next time!
      </Text>
      <Group justify='center'>
        <Button
          component={Link}
          size='md'
          to='/feed'
          style={{ textDecoration: 'none', color: 'white' }}>
          Take me back to home page
        </Button>
      </Group>
    </Container>
  );
}
