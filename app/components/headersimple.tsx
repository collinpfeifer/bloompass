import { Text, Container, Group, Image, rem, Button } from '@mantine/core';
import { Link } from '@remix-run/react';
import png from '../assets/Bloompass_logo.png';
import classes from '../styles/headersimple.module.css';

export default function HeaderSimple() {
  return (
    <Container className={classes.header}>
      <Image src={png} maw={rem(200)} />
      <Group>
        <Button
          radius='xl'
          size='lg'
          component={Link}
          prefetch='render'
          to='/login'
          style={{
            background: 'linear-gradient(270deg, teal, purple)',
            color: 'white',
            textDecoration: 'none',
          }}>
            <Text size='xl'>Login</Text>
        </Button>
        {/* <Button
          radius='xl'
          size='lg'
          style={{
            background: 'linear-gradient(90deg, teal, green)',
          }}>
          <Link
            prefetch='intent'
            to='/signup'
            style={{ color: 'white', textDecoration: 'none' }}>
            <Text size='xl'>Sign up</Text>
          </Link>
        </Button> */}
      </Group>
    </Container>
  );
}
