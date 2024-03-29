import {
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { getUser } from '../session.server';
import {
  getTickets,
  searchTicketsByNotSold,
  searchTicketsByQuery,
  searchTicketsByQueryAndNotSold,
} from '../models/ticket.server';
import { Form, Link, useLoaderData, useNavigate } from '@remix-run/react';
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
  Text,
  Checkbox,
} from '@mantine/core';
import { getHashtags } from '../models/hashtag.server';
import type { Hashtag, Ticket } from '@prisma/client';
import TicketCard from '../components/ticketcard';
import HeaderUser from '../components/headeruser';
import { useForm } from '@mantine/form';
import HashtagInput from '../components/hashtaginput';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import _ from 'lodash';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('query');
  const nS = Boolean(url.searchParams.get('notSold'));
  const redirectTo = url.searchParams.get('redirectTo');
  const querySchema = z
    .string()
    .transform((val) => {
      if (val.length > 0) return val.trim();
      else return null;
    })
    .nullable();
  const notSoldSchema = z.boolean().nullable();
  const query = querySchema.parse(q);
  const notSold = notSoldSchema.parse(nS);
  const user = await getUser(request);
  if (redirectTo) {
    return redirect(redirectTo);
  }
  const allHashtags = await (await getHashtags()).json();
  if (query && notSold)
    return json({
      hashtags: allHashtags,
      user,
      tickets: await (
        await searchTicketsByQueryAndNotSold({ query, notSold })
      ).json(),
      baseUrl: process.env.BASE_URL,
    });
  else if (query)
    return json({
      hashtags: allHashtags,
      user,
      tickets: await (await searchTicketsByQuery({ query })).json(),
      baseUrl: process.env.BASE_URL,
    });
  else if (notSold)
    return json({
      hashtags: allHashtags,
      user,
      tickets: await (await searchTicketsByNotSold({ notSold })).json(),
      baseUrl: process.env.BASE_URL,
    });
  else
    return json({
      user,
      hashtags: allHashtags,
      tickets: await (await getTickets()).json(),
      baseUrl: process.env.BASE_URL,
    });
};

export const meta: MetaFunction = () => [{ title: 'Feed' }];

export default function Feed() {
  const { tickets, hashtags, user, baseUrl } = useLoaderData<typeof loader>();

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      query: '',
      notSold: false,
    },
    validate: {
      query: (val) => {
        if (val && val.length < 1)
          return 'Search query must be at least 1 character';
        if (val.length > 500)
          return 'Search query must be less than 500 characters';
        return false;
      },
    },
  });

  const [modalOpened, { open: modalOpen, close: modalClose }] =
    useDisclosure(false);
  const [selected, setSelected] = useState<Hashtag[]>([]);
  const navigate = useNavigate();

  const modalForm = useForm({
    validateInputOnChange: true,
    initialValues: {
      title: '',
      description: '',
      dateTime: '',
      price: undefined,
      link: '',
      hashtags: [],
      newHashtags: [],
    },
    validate: {
      title: (val) => {
        if (val.length < 1) return 'Title must be at least 1 character';
        if (val.length > 50) return 'Title must be less than 50 characters';
        return false;
      },
      description: (val) => {
        if (val.length > 500)
          return 'Description must be less than 500 characters';
        return false;
      },
      dateTime: (val) => {
        if (!val) return 'Date and time is required';
        if (new Date(val).getTime() < Date.now())
          return 'Date and time must be in the future';
        return false;
      },
      price: (val) => {
        if (!val) return 'Price is required';
        if (val < 0) return 'Price must be greater than 0';
        return false;
      },
      link: (val) => {
        if (!val) return 'Link is required';
        if (!val.includes('http://') && !val.includes('https://'))
          return 'Link must be a valid URL';
        return false;
      },
    },
  });

  // limit tickets to 30 of the most recently created / closest to starting / cheapest

  // search will return all tickets that match the query sorted descending from the starting time
  // hashtags will work the same way, but will only return tickets that have the hashtag

  return (
    <>
      <Modal opened={modalOpened} onClose={modalClose} title='Add Ticket'>
        <Form
          onSubmit={modalForm.onSubmit(async (values) => {
            modalClose();
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('dateTime', values.dateTime);
            formData.append('price', String(values.price));
            formData.append('link', values.link);
            formData.append('hashtags', JSON.stringify(values.hashtags));
            formData.append('newHashtags', JSON.stringify(values.newHashtags));
            const data = await (
              await fetch('/api/tickets/create', {
                method: 'POST',
                body: formData,
              })
            ).json();
            console.log('data', data);
            if (data.ticket) {
              // handlers.prepend(data.ticket);
              notifications.show({
                title: 'Ticket Added',
                message: 'Your ticket has been added successfully',
                color: 'teal',
                autoClose: 5000,
              });
              navigate(`/tickets/${data.ticket.id}`);
            } else {
              notifications.show({
                title: 'Ticket Not Added',
                message: 'Your ticket could not be added',
                color: 'red',
                autoClose: 5000,
              });
            }
          })}>
          <TextInput
            label='Title'
            placeholder='Title'
            name='title'
            required
            {...modalForm.getInputProps('title')}
            error={modalForm.errors.title}
          />
          <TextInput
            label='Description'
            placeholder='Description'
            name='description'
            {...modalForm.getInputProps('description')}
            error={modalForm.errors.description}
          />
          <DateTimePicker
            label='Date and Time'
            clearable
            placeholder='Date and Time'
            valueFormat='MMM DD YYYY hh:mm A'
            required
            name='dateTime'
            {...modalForm.getInputProps('dateTime')}
            error={modalForm.errors.dateTime}
          />
          <NumberInput
            label='Price'
            placeholder='Price'
            name='price'
            prefix='$'
            decimalScale={2}
            allowNegative={false}
            fixedDecimalScale
            required
            {...modalForm.getInputProps('price')}
            error={modalForm.errors.price}
          />
          <TextInput
            label='Link'
            placeholder='Link cannot be changed after ticket creation'
            name='link'
            required
            {...modalForm.getInputProps('link')}
            error={modalForm.errors.link}
          />
          <HashtagInput
            hashtags={hashtags}
            error={modalForm.errors.hashtags}
            selected={selected}
            setSelected={setSelected}
          />
          <Button
            type='submit'
            onClick={() => {
              const [existingHashtags, newHashtags] = _.partition(
                selected,
                (item: Hashtag) => item.id.substring(0, 4) !== 'new_'
              );
              modalForm.setFieldValue('hashtags', existingHashtags);
              modalForm.setFieldValue('newHashtags', newHashtags);
            }}>
            Submit
          </Button>
        </Form>
      </Modal>
      <HeaderUser user={user} />
      <Box miw='70%' mih='78.5dvh'>
        <Stack>
          {user ? (
            <Button m='auto' onClick={() => modalOpen()}>
              Add Ticket
            </Button>
          ) : (
            <Button
              component={Link}
              to='/login'
              prefetch='render'
              m='auto'
              style={{ textDecoration: 'none', color: 'black' }}>
              Login to Add Ticket
            </Button>
          )}
          <Form method='get'>
            <Group>
              <TextInput
                name='query'
                placeholder='Search for tickets and hashtags'
                m='auto'
                w='80%'
                {...form.getInputProps('query')}
              />
              <Group m='auto'>
                <Checkbox
                  name='notSold'
                  label='Not Sold'
                  {...form.getInputProps('notSold')}
                />
                <Button
                  disabled={
                    form.values.query.length < 2 && !form.values.notSold
                  }
                  type='submit'>
                  Search
                </Button>
                <Button
                  type='reset'
                  onClick={() => {
                    form.reset();
                    navigate('/feed');
                  }}>
                  Clear
                </Button>
              </Group>
            </Group>
          </Form>
          <Box m='auto'>
            {tickets.length > 0 ? (
              tickets.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket.id}
                  id={ticket.id}
                  title={ticket.title}
                  description={ticket.description}
                  dateTime={ticket.dateTime}
                  link={ticket.link}
                  sold={ticket.sold}
                  price={Number(ticket.price)}
                  sellerUserId={ticket.sellerUserId}
                  buyerUserId={ticket.buyerUserId}
                  userId={user?.id}
                  baseUrl={baseUrl}
                  hashtags={ticket.hashtags}
                  allHashtags={hashtags}
                />
              ))
            ) : (
              <Text c='white'>No tickets found</Text>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  );
}
