import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Modal,
  Select,
  TextInput,
} from '@mantine/core';
import classes from '../styles/ticket.module.css';
import { Hashtag } from '@prisma/client';
import { convertDateString } from '../utils/convertDateString';
import { Form, Link } from '@remix-run/react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

export default function TicketCard({
  id,
  title,
  dateTime,
  description,
  price,
  sellerUserId,
  buyerUserId,
  link,
  userId,
  hashtags,
}: {
  id: string;
  title: string;
  price: number;
  description: string | null | undefined;
  dateTime: string;
  sellerUserId: string;
  userId: string | null | undefined;
  link: string;
  buyerUserId: string | null | undefined;
  hashtags: Hashtag[] | null | undefined;
}) {
  const { dayOfWeek, day, month, year, time } = convertDateString(dateTime);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      reason: '',
      message: '',
    },
  });
  return (
    <>
      <Modal opened={opened} onClose={close} title='Report and/or Refund'>
        <Form>
          <Select
            withAsterisk
            required
            {...form.getInputProps('reason')}
            data={[
              'Ticket did not scan/work at event',
              'Not able to access Ticket',
              'Not going to event anymore',
              'Other',
            ]}
          />
          <TextInput withAsterisk required {...form.getInputProps('message')} />
          <Button type='submit'>Send report</Button>
        </Form>
      </Modal>
      <Card withBorder radius='md' className={classes.card}>
        <Group justify='space-between' mt='md'>
          <div>
            <Text fw={500}>{title}</Text>
            <Text fz='xs' c='dimmed'>
              {description}
            </Text>
          </div>
          <Badge variant='outline'>{`${dayOfWeek} ${month} ${day}, ${year} ${time} `}</Badge>
        </Group>

        {buyerUserId === userId || sellerUserId === userId ? (
          <Card.Section className={classes.section} mt='md'>
            <Text fz='xs' c='dimmed' className={classes.label}>
              Link
            </Text>
            {link}
          </Card.Section>
        ) : null}

        <Card.Section className={classes.section} mt='md'>
          <Text fz='sm' c='dimmed' className={classes.label}>
            Hashtags
          </Text>

          <Group gap={8} mb={-8}>
            {hashtags?.map((hashtag) => (
              <Badge key={hashtag.id} variant='outline'>
                {hashtag.title}
              </Badge>
            ))}
          </Group>
        </Card.Section>

        <Card.Section className={classes.section}>
          <Group gap={30}>
            <div>
              <Text fz='xl' fw={700} style={{ lineHeight: 1 }}>
                {`$${price}`}
              </Text>
            </div>
            {!userId ? (
              <Button>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/login?redirectTo=/tickets/${id}`}>
                  Login to Buy
                </Link>
              </Button>
            ) : userId && sellerUserId !== userId && !buyerUserId ? (
              <Form method='post' action='/api/stripe/buy'>
                <input type='hidden' name='ticketId' value={id} />
                <input type='hidden' name='buyerUserId' value={userId} />
                <Button
                  type='submit'
                  radius='xl'
                  style={{ flex: 1 }}
                  disabled={!userId || buyerUserId}>
                  Buy now
                </Button>
              </Form>
            ) : sellerUserId === userId ? (
              <Button>
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to='/edit'>
                  Edit Ticket
                </Link>
              </Button>
            ) : (
              buyerUserId === userId && (
                <Button onClick={open}>Report and/or Refund</Button>
              )
            )}
          </Group>
        </Card.Section>
      </Card>
    </>
  );
}
