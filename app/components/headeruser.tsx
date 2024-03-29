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
  IconUserCircle,
} from '@tabler/icons-react';
import classes from '../styles/headeruser.module.css';
import { User } from '@prisma/client';
import { Form, Link } from '@remix-run/react';

export default function HeaderUser({ user }: { user: User }) {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 30em)');

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
                  component={Link}
                  prefetch='render'
                  style={{ textDecoration: 'none', color: 'black' }}
                  to='/feed'
                  leftSection={
                    <IconHome
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.gray[6]}
                      stroke={1.5}
                    />
                  }>
                  Feed
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  prefetch='render'
                  style={{ textDecoration: 'none', color: 'black' }}
                  to='/tickets/selling'
                  leftSection={
                    <IconPigMoney
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.green[6]}
                      stroke={1.5}
                    />
                  }>
                  Selling Tickets
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  prefetch='render'
                  style={{ textDecoration: 'none', color: 'black' }}
                  to='/tickets/bought'
                  leftSection={
                    <IconTicket
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                      stroke={1.5}
                    />
                  }>
                  Bought Tickets
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
                <Menu.Item
                  component={Link}
                  prefetch='render'
                  style={{ textDecoration: 'none', color: 'black' }}
                  to='/profile'
                  leftSection={
                    <IconUserCircle
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }>
                  Profile
                </Menu.Item>
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
            <Button
              component={Link}
              to='/login'
              style={{ textDecoration: 'none', color: 'white' }}>
              <Text fw={500} size='sm' lh={1} mr={3}>
                Login
              </Text>
            </Button>
          )}
        </Group>
      </Container>
    </div>
  );
}
