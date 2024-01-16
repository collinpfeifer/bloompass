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
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLogout,
  IconChevronDown,
  IconPigMoney,
  IconTicket,
  IconHome,
} from '@tabler/icons-react';
import classes from '../styles/headeruser.module.css';
import { User } from '@prisma/client';
import { Form, Link } from '@remix-run/react';

export default function HeaderUser({ user }: { user: User }) {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size='md'>
        <Group justify='space-between'>
          {user ? (
            <Menu
              width={260}
              position='bottom-end'
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal>
              <Menu.Target>
                {isMobile ? (
                  <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom='xs'
                    size='sm'
                  />
                ) : (
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
                )}
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconHome
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.gray[6]}
                      stroke={1.5}
                    />
                  }>
                  <Link
                    prefetch='render'
                    style={{ textDecoration: 'none', color: 'black' }}
                    to='/feed'>
                    Feed
                  </Link>
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconPigMoney
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.green[6]}
                      stroke={1.5}
                    />
                  }>
                  <Link
                    prefetch='render'
                    style={{ textDecoration: 'none', color: 'black' }}
                    to='/tickets/selling'>
                    Selling Tickets
                  </Link>
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconTicket
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                      stroke={1.5}
                    />
                  }>
                  <Link
                    prefetch='render'
                    style={{ textDecoration: 'none', color: 'black' }}
                    to='/tickets/bought'>
                    Bought Tickets
                  </Link>
                </Menu.Item>
                <Menu.Label>Settings</Menu.Label>
                {/* <Form method='post' action='/api.stripe.dashboard'>
                <Menu.Item
                  leftSection={
                    <IconSettings
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }>
                  Payment Dashboard
                </Menu.Item>
                </Form> */}
                <Form method='post' action='/logout'>
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
  );
}
