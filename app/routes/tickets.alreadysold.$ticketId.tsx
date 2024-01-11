import {
  LoaderFunction,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { getTicket } from '../models/ticket.server';
import { Link, useLoaderData } from '@remix-run/react';
import { Title, Group, Button, Container, Text } from '@mantine/core';
import classes from '../styles/notfound.module.css';

export const loader: LoaderFunction = async ({
  params,
}: LoaderFunctionArgs) => {
  const ticketId = params.ticketId;
  if (!ticketId) return redirect('/feed');
  const ticket = await (await getTicket({ id: ticketId })).json();
  return json({ ticket });
};

export default function AlreadySold() {
  const { ticket } = useLoaderData<typeof loader>();
  return (
    <Container className={classes.root}>
      <div className={classes.label}>Aw you just missed it!</div>
      <Title className={classes.title}>
        Someone bought this ticket before you did
      </Title>
      <Text size='lg' ta='center' className={classes.description}>
        More specifically, this ticket was bought
        {Date.now() - Date.parse(ticket.soldAt)} ago. Better luck next time!
      </Text>
      <Group justify='center'>
        <Button variant='subtle' size='md'>
          <Link to='/feed' style={{ textDecoration: 'none', color: 'white' }}>
            Take me back to home page
          </Link>
        </Button>
      </Group>
    </Container>
  );
}
