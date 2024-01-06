import { Card, Text, Group, Badge, Button } from '@mantine/core';

import classes from '../styles/ticket.module.css';
import { Hashtag } from '@prisma/client';
import { convertDateString } from '../utils/convertDateString';
import { Form, Link } from '@remix-run/react';

export default function TicketCard({
  id,
  title,
  dateTime,
  description,
  price,
  sellerUserId,
  userId,
  hashtags,
}: {
  id: string;
  title: string;
  price: number;
  description: string | null;
  dateTime: string;
  sellerUserId: string;
  userId: string;
  hashtags: Hashtag[] | null;
}) {
  const { dayOfWeek, day, month, year, time } = convertDateString(dateTime);
  return (
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
          {sellerUserId !== userId ? (
            <Form method='post' action='/api/stripe/buy'>
              <input type='hidden' name='ticketId' value={id} />
              <input type='hidden' name='buyerUserId' value={userId} />
              <Button type='submit' radius='xl' style={{ flex: 1 }}>
                Buy now
              </Button>
            </Form>
          ) : (
            <Button>
              <Link
                style={{ textDecoration: 'none', color: 'white' }}
                to='/edit'>
                Edit Ticket
              </Link>
            </Button>
          )}
        </Group>
      </Card.Section>
    </Card>
  );
}
