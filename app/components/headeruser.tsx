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
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout,
  IconHeart,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react';
import classes from '../styles/headeruser.module.css';
import { User } from '@prisma/client';
import { Form, Link } from '@remix-run/react';


export default function HeaderUser({
  user,
}: {
  user: User;
}) {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
      <div className={classes.header}>
        <Container className={classes.mainSection} size='md'>
          <Group justify='space-between'>
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
  );
}
