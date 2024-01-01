import { Text, Container, Group, Image, rem, Button } from '@mantine/core';
import { Link } from '@remix-run/react';
import { useToggle } from '@mantine/hooks';
import png from '../assets/Bloompass_logo.png';
import classes from '../styles/headersimple.module.css';

export default function HeaderSimple() {
  const [userButtonClicked, userToggle] = useToggle([false, true]);
  const [organizationButtonClicked, organizationToggle] = useToggle([
    false,
    true,
  ]);

  return (
    <Container className={classes.header}>
      <Image src={png} maw={rem(200)} />
      <Group>
        <Button
          radius='xl'
          size='lg'
          style={{
            background: 'linear-gradient(270deg, teal, purple)',
          }}
          loading={userButtonClicked}
          onClick={() => userToggle()}>
          <Link prefetch='intent' to='/login'>
            <Text size='xl'>Login</Text>
          </Link>
        </Button>
        <Button
          radius='xl'
          size='lg'
          style={{
            background: 'linear-gradient(90deg, teal, green)',
          }}
          loading={organizationButtonClicked}
          onClick={() => organizationToggle()}>
          <Link prefetch='intent' to='/signup'>
            <Text size='xl'>Sign up</Text>
          </Link>
        </Button>
      </Group>
    </Container>
  );
}
