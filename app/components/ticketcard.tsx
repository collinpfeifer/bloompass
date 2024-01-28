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
  Menu,
  NumberInput,
  TextInput,
  ActionIcon,
  CopyButton,
  Flex,
  Tooltip,
} from '@mantine/core';
import classes from '../styles/ticket.module.css';
import { Hashtag } from '@prisma/client';
import { convertDateString } from '../utils/convertDateString';
import { Form, Link, useNavigate, useLocation } from '@remix-run/react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { DateTimePicker } from '@mantine/dates';
import _ from 'lodash';
import HashtagInput from './hashtaginput';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

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
  baseUrl,
  allHashtags,
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
  baseUrl: string;
  buyerUserId: string | null | undefined;
  hashtags: Hashtag[] | null | undefined;
  allHashtags?: Hashtag[];
}) {
  const { dayOfWeek, day, month, year, time } = convertDateString(dateTime);
  const location = useLocation();
  const [opened, { open, close }] = useDisclosure(false);
  const [editFormOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [selected, setSelected] = useState<Hashtag[]>(hashtags);
  const navigate = useNavigate();
  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      reason: '',
      refund: false,
      message: '',
    },
  });
  const editForm = useForm({
    validateInputOnChange: true,
    initialValues: {
      title: title,
      description: description,
      price: price,
      dateTime: new Date(dateTime),
      hashtags: hashtags,
      newHashtags: [],
      removedHashtags: [],
    },
    validate: {
      title: (val) => {
        if (val.length < 1) return 'Title must be at least 1 character';
        if (val.length > 50) return 'Title must be less than 50 characters';
        return false;
      },
      description: (val) => {
        if (val && val.length > 500)
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
    },
  });

  function buttons() {
    if (!userId) {
      return (
        <Button
          component={Link}
          style={{ textDecoration: 'none', color: 'white' }}
          to={`/login?redirectTo=/tickets/${id}`}>
          Login to Buy
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
    } else if (sellerUserId === userId && !sold) {
      return (
        <Menu
          width={260}
          position='bottom-end'
          transitionProps={{ transition: 'pop-top-right' }}
          withinPortal>
          <Menu.Target>
            <IconSettings
              style={{ width: 20, height: 20 }}
              stroke={1.5}
              color='black'
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconEdit
                  style={{ width: 16, height: 16 }}
                  stroke={1.5}
                  color='green'
                />
              }
              onClick={openEdit}>
              Edit Ticket
            </Menu.Item>
            <Form
              onSubmit={async () => {
                const formData = new FormData();
                formData.append('ticketId', id);
                const data = await (
                  await fetch('/api/tickets/delete', {
                    method: 'POST',
                    body: formData,
                  })
                ).json();
                if (data.success) {
                  notifications.show({
                    title: 'Ticket Deleted',
                    message: 'Your ticket has been deleted successfully',
                    color: 'teal',
                    autoClose: 5000,
                  });
                  if (
                    location.pathname === `/tickets/${id}` ||
                    location.pathname === '/feed'
                  ) {
                    navigate('/feed');
                  } else if (location.pathname === '/tickets/selling') {
                    navigate('/tickets/selling');
                  }
                } else {
                  notifications.show({
                    title: 'Ticket Not Deleted',
                    message: 'Your ticket could not be deleted',
                    color: 'red',
                    autoClose: 5000,
                  });
                }
              }}>
              <Menu.Item
                leftSection={
                  <IconTrash
                    style={{ width: 16, height: 16 }}
                    stroke={1.5}
                    color='red'
                  />
                }
                type='submit'>
                Delete Ticket
              </Menu.Item>
            </Form>
          </Menu.Dropdown>
        </Menu>
      );
    } else if (buyerUserId === userId) {
      return <Button onClick={open}>Report and/or Refund</Button>;
    } else return null;
  }
  return (
    <>
      <Modal opened={editFormOpened} onClose={closeEdit} title='Edit Ticket'>
        <Form
          onSubmit={editForm.onSubmit(async (values) => {
            closeEdit();
            const formData = new FormData();
            formData.append('id', id);
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('dateTime', values.dateTime);
            formData.append('price', String(values.price));
            formData.append('hashtags', JSON.stringify(values.hashtags));
            formData.append('newHashtags', JSON.stringify(values.newHashtags));
            formData.append(
              'removedHashtags',
              JSON.stringify(values.removedHashtags)
            );
            const data = await (
              await fetch('/api/tickets/edit', {
                method: 'POST',
                body: formData,
              })
            ).json();
            if (data.ticket) {
              notifications.show({
                title: 'Ticket Edited',
                message: 'Your ticket has been edited successfully',
                color: 'teal',
                autoClose: 5000,
              });
              navigate(`/tickets/${data.ticket.id}`);
            } else {
              notifications.show({
                title: 'Ticket Not Edited',
                message: 'Your ticket could not be edited',
                color: 'red',
                autoClose: 5000,
              });
            }
          })}>
          <input type='hidden' name='id' value={id} />
          <TextInput
            label='Title'
            placeholder='Title'
            name='title'
            required
            {...editForm.getInputProps('title')}
            error={editForm.errors.title}
          />
          <TextInput
            label='Description'
            placeholder='Description'
            name='description'
            {...editForm.getInputProps('description')}
            error={editForm.errors.description}
          />
          <DateTimePicker
            label='Date and Time'
            placeholder='Date and Time'
            valueFormat='MMM DD YYYY hh:mm A'
            required
            name='dateTime'
            {...editForm.getInputProps('dateTime')}
            error={editForm.errors.dateTime}
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
            {...editForm.getInputProps('price')}
            error={editForm.errors.price}
          />
          <TextInput
            label='Link'
            placeholder='Link'
            name='link'
            disabled={true}
            value={link}
          />
          <HashtagInput
            hashtags={allHashtags}
            error={editForm.errors.hashtags}
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
              const removedHashtags = _.difference(hashtags, existingHashtags);
              editForm.setFieldValue('hashtags', existingHashtags);
              editForm.setFieldValue('newHashtags', newHashtags);
              editForm.setFieldValue('removedHashtags', removedHashtags);
            }}>
            Submit
          </Button>
        </Form>
      </Modal>
      <Modal opened={opened} onClose={close} title='Report and/or Refund'>
        <Form
          onSubmit={form.onSubmit(async (values) => {
            close();
            const formData = new FormData();
            formData.append('reason', values.reason);
            formData.append('refund', String(values.refund));
            formData.append('message', values.message);
            formData.append('ticketId', id);
            if (userId) formData.append('userId', userId);
            formData.append('sellerUserId', sellerUserId);
            if (buyerUserId) formData.append('buyerUserId', buyerUserId);
            const data = await (
              await fetch('/api/reportorrefund', {
                method: 'POST',
                body: formData,
              })
            ).json();
            if (data.success) {
              notifications.show({
                title: 'Report Sent',
                message: 'Your report has been sent and reviewed soon',
                color: 'teal',
                autoClose: 5000,
              });
            } else {
              notifications.show({
                title: 'Report Not Sent',
                message: 'Your report could not be sent',
                color: 'red',
                autoClose: 5000,
              });
            }
          })}>
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
            <Button type='submit'>Send report</Button>
          </Stack>
        </Form>
      </Modal>
      <Card withBorder radius='md' className={classes.card}>
        <Group justify='space-between' mt='md'>
          <div>
            <Text fw={500}>{title}</Text>
            <Text fz='xs' c='dimmed' maw='150px'>
              {description}
            </Text>
          </div>
          <Stack>
            <Badge variant='outline'>{`${dayOfWeek} ${month} ${day}, ${year} ${time} `}</Badge>
            {sold && (
              <Badge color='red'>Sold</Badge>
            )}
            {sellerUserId === userId && !sold && (
              <Badge color='blue'>Selling</Badge>
            )}
          </Stack>
        </Group>

        {(buyerUserId === userId || sellerUserId === userId) && (
          <Card.Section className={classes.section} mt='md'>
            <Text fz='xs' c='dimmed' className={classes.label}>
              Ticket Link
            </Text>
            <a href={link} target='_blank'>
              {link}
            </a>
          </Card.Section>
        )}
        {sellerUserId === userId && baseUrl && (
          <Card.Section className={classes.section}>
            <Text fz='xs' c='dimmed' className={classes.label}>
              Share Link
            </Text>
            <Flex
              bg='gray'
              wrap='nowrap'
              m={1}
              p={2}
              justify='space-between'
              maw={350}>
              <Text c='white ' m={3} lineClamp={1}>
                {`${baseUrl}/tickets/${id}`}
              </Text>
              <CopyButton value={`${baseUrl}/tickets/${id}`} timeout={2000}>
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
          </Card.Section>
        )}

        {hashtags && hashtags.length > 0 && (
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
