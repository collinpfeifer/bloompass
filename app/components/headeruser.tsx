import cx from 'clsx';
import { useState } from 'react';
import {
  Container,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Burger,
  rem,
  useMantineTheme,
  Button,
  Modal,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout,
  IconHeart,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react';
import classes from '../styles/headeruser.module.css';
import { Hashtag, User } from '@prisma/client';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import { Form, Link, useActionData } from '@remix-run/react';
import HashtagInput from './hashtaginput';

export default function HeaderUser({
  user,
  hashtags,
}: {
  user: User;
  hashtags: Hashtag[];
}) {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const data = useActionData();

  const [modalOpened, { open: modalOpen, close: modalClose }] =
    useDisclosure(false);
  const [selected, setSelected] = useState<Hashtag[]>([]);

  const form = useForm({
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

  return (
    <>
      <Modal opened={modalOpened} onClose={modalClose} title='Add Ticket'>
        <Form
          onSubmit={form.onSubmit(async (values) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('dateTime', values.dateTime);
            formData.append('price', String(values.price));
            formData.append('link', values.link);
            console.log(values.hashtags);
            console.log(values.newHashtags);
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
              const existingHashtags = selected.filter(
                (item) => !item.title.startsWith('new_')
              );
              const newHashtags = selected.filter((item) =>
                item.title.startsWith('new_')
              );
              form.setFieldValue('hashtags', existingHashtags);
              form.setFieldValue('newHashtags', newHashtags);
              close();
            }}>
            Submit
          </Button>
        </Form>
      </Modal>

      <div className={classes.header}>
        <Container className={classes.mainSection} size='md'>
          <Group justify='space-between'>
            {user && <Button onClick={() => modalOpen()}>Add Ticket</Button>}
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom='xs'
              size='sm'
            />

            {user ? (
              <Menu
                width={260}
                position='bottom-end'
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal>
                <Menu.Target>
                  <UnstyledButton
                    className={cx(classes.user, {
                      [classes.userActive]: userMenuOpened,
                    })}>
                    <Group gap={7}>
                      <Text fw={500} size='sm' lh={1} mr={3}>
                        {user.email}
                      </Text>
                      <IconChevronDown
                        style={{ width: rem(12), height: rem(12) }}
                        stroke={1.5}
                      />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={
                      <IconHeart
                        style={{ width: rem(16), height: rem(16) }}
                        color={theme.colors.red[6]}
                        stroke={1.5}
                      />
                    }>
                    Tickets
                  </Menu.Item>

                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconSettings
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }>
                    Account settings
                  </Menu.Item>
                  <Form action='/logout'>
                    <Menu.Item
                      leftSection={
                        <IconLogout
                          style={{ width: rem(16), height: rem(16) }}
                          stroke={1.5}
                        />
                      }
                      type='submit'>
                      Logout
                    </Menu.Item>
                  </Form>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button>
                <Text fw={500} size='sm' lh={1} mr={3}>
                  <Link to='/login'>Login</Link>
                </Text>
              </Button>
            )}
          </Group>
        </Container>
      </div>
    </>
  );
}
