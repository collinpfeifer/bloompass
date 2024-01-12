import {
  Card,
  Text,
  Group,
  Badge,
  Button,
  Modal,
  Select,
  Textarea,
  Checkbox,
  Stack,
  NumberFormatter,
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
  sold,
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
  sold: boolean;
  buyerUserId: string | null | undefined;
  hashtags: Hashtag[] | null | undefined;
}) {
  const { dayOfWeek, day, month, year, time } = convertDateString(dateTime);
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      reason: '',
      refund: false,
      message: '',
    },
  });

  function buttons() {
    if (!userId) {
      return (
        <Button>
          <Link
            style={{ textDecoration: 'none', color: 'white' }}
            to={`/login?redirectTo=/tickets/${id}`}>
            Login to Buy
          </Link>
        </Button>
      );
    } else if (userId && sellerUserId !== userId && !buyerUserId) {
      return (
        <Form method='post' action='/api/stripe/buy'>
          <input type='hidden' name='ticketId' value={id} />
          <input type='hidden' name='buyerUserId' value={userId} />
          <Button
            type='submit'
            radius='xl'
            style={{ flex: 1 }}
            disabled={sold || !userId}>
            Buy now
          </Button>
        </Form>
      );
    }
    // else if (sellerUserId === userId && !buyerUserId) {
    //   return (
    //     <Button>
    //       <Link style={{ textDecoration: 'none', color: 'white' }} to='/edit'>
    //         Edit Ticket
    //       </Link>
    //     </Button>
    //   );
    // }
    else if (buyerUserId === userId) {
      return <Button onClick={open}>Report and/or Refund</Button>;
    } else return null;
  }
  return (
    <>
      <Modal opened={opened} onClose={close} title='Report and/or Refund'>
        <Form method='post' action='/api/reportorrefund'>
          <Stack>
            <Select
              withAsterisk
              required
              name='reason'
              label='Reason'
              {...form.getInputProps('reason')}
              placeholder='Reason for report/refund'
              data={[
                'Ticket did not scan/work at event',
                'Not able to access Ticket',
                'Not going to event anymore',
                'Other',
              ]}
            />
            <Checkbox
              label='Refund?'
              name='refund'
              labelPosition='left'
              {...form.getInputProps('refund', { type: 'checkbox' })}
            />
            <Textarea
              withAsterisk
              label='Report Message'
              placeholder='Please provide a description of your issue and include your name, email, and/or phone number so that I can contact you'
              name='message'
              required
              {...form.getInputProps('message')}
            />
            <input type='hidden' name='ticketId' value={id} />
            <input type='hidden' name='userId' value={userId} />
            <input type='hidden' name='sellerUserId' value={sellerUserId} />
            <input type='hidden' name='buyerUserId' value={buyerUserId} />
            <Button type='submit' onClick={close}>
              Send report
            </Button>
          </Stack>
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
          <Stack>
            <Badge variant='outline'>{`${dayOfWeek} ${month} ${day}, ${year} ${time} `}</Badge>
            {sold && sellerUserId === userId && (
              <Badge color='green'>Sold</Badge>
            )}
            {sellerUserId === userId && <Badge color='blue'>Selling</Badge>}
            {sold && buyerUserId === userId && (
              <Badge color='red'>Bought</Badge>
            )}
          </Stack>
        </Group>

        {(buyerUserId === userId || sellerUserId === userId) && (
          <Card.Section className={classes.section} mt='md'>
            <Text fz='xs' c='dimmed' className={classes.label}>
              Link
            </Text>
            <a href={link}>{link}</a>
          </Card.Section>
        )}

        {hashtags?.length > 0 && (
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
        )}

        <Card.Section className={classes.section}>
          <Group gap={30}>
            <Text fz='xl' fw={700} style={{ lineHeight: 1 }}>
              <NumberFormatter prefix='$ ' value={price} thousandSeparator />
            </Text>
            {buttons()}
          </Group>
        </Card.Section>
      </Card>
    </>
  );
}
