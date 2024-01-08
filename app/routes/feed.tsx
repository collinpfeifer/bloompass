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
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
} from '@mantine/core';
import { getHashtags } from '../models/hashtag.server';
import type { Hashtag, Ticket } from '@prisma/client';
import TicketCard from '../components/ticketcard';
import HeaderUser from '../components/headeruser';
import { z } from 'zod';
import { useForm } from '@mantine/form';
import HashtagInput from '../components/hashtaginput';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import _ from 'lodash';
import { useState } from 'react';

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

  const data = useActionData();

  const [modalOpened, { open: modalOpen, close: modalClose }] =
    useDisclosure(false);
  const [selected, setSelected] = useState<Hashtag[]>([]);

  const modalForm = useForm({
    initialValues: {
      title: '',
      description: '',
      dateTime: '',
      price: undefined,
      link: '',
      hashtags: [],
      newHashtags: [],
    },
    validate: {},
  });

  // limit tickets to 30 of the most recently created / closest to starting / cheapest

  // search will return all tickets that match the query sorted descending from the starting time
  // hashtags will work the same way, but will only return tickets that have the hashtag

  return (
    <>
      <Modal opened={modalOpened} onClose={modalClose} title='Add Ticket'>
        <Form
          onSubmit={modalForm.onSubmit(async (values) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('dateTime', values.dateTime);
            formData.append('price', String(values.price));
            formData.append('link', values.link);
            formData.append('hashtags', JSON.stringify(values.hashtags));
            formData.append('newHashtags', JSON.stringify(values.newHashtags));

            await fetch('/api/tickets/create', {
              method: 'POST',
              body: formData,
            });
          })}>
          <TextInput
            label='Title'
            placeholder='Title'
            required
            error={data?.errors?.title || form.errors.title}
            {...form.getInputProps('title')}
          />
          <TextInput
            label='Description'
            placeholder='Description'
            error={data?.errors?.description || form.errors.description}
            {...form.getInputProps('description')}
          />
          <DateTimePicker
            label='Date and Time'
            placeholder='Date and Time'
            required
            error={data?.errors?.dateTime || form.errors.dateTime}
            {...form.getInputProps('dateTime')}
          />
          <NumberInput
            label='Price'
            placeholder='Price'
            required
            error={data?.errors?.price || form.errors.price}
            {...form.getInputProps('price')}
          />
          <TextInput
            label='Link'
            placeholder='Link'
            required
            error={data?.errors?.link || form.errors.link}
            {...form.getInputProps('link')}
          />
          <HashtagInput
            hashtags={hashtags}
            error={data?.errors?.hashtags || form.errors.hashtags}
            selected={selected}
            setSelected={setSelected}
          />
          <Button
            type='submit'
            onClick={() => {
              modalClose();
              const [existingHashtags, newHashtags] = _.partition(
                selected,
                (item: Hashtag) => item.id.substring(0, 4) !== 'new_'
              );
              form.setFieldValue('hashtags', existingHashtags);
              form.setFieldValue('newHashtags', newHashtags);
            }}>
            Submit
          </Button>
        </Form>
      </Modal>
      <HeaderUser user={user} />
      <Box miw='70%' mih='78.5dvh'>
        <Stack>
          {user &&
            (user.onboardingComplete ? (
              <Button m='auto' onClick={() => modalOpen()}>Add Ticket</Button>
            ) : (
              <Button m='auto'>
                <Link
                  style={{ color: ' white', textDecoration: 'none' }}
                  to='/api/stripe/authorize'>
                  Complete Onboarding to Add Ticket
                </Link>
              </Button>
            ))}
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
