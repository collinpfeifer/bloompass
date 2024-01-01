import { Card, Text, Group, Badge, Button } from '@mantine/core';

import classes from '../styles/ticket.module.css';
import { Hashtag } from '@prisma/client';
import { convertDateString } from '../utils/convertDateString';

export default function TicketCard({
  title,
  dateTime,
  description,
  price,
  hashtags,
}: {
  title: string;
  price: number;
  description: string | null;
  dateTime: string;
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

          <Button radius='xl' style={{ flex: 1 }}>
            Buy now
          </Button>
        </Group>
      </Card.Section>
    </Card>
  );
}
