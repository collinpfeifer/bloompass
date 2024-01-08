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

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const id = params.id;
  if (!id) return redirect('/feed');
  const ticket = await (await getTicket({ id })).json();
  return json({ user, ticket });
};

export default function Ticket() {
  const { user, ticket } = useLoaderData<typeof loader>();
  return (
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
  );
}
