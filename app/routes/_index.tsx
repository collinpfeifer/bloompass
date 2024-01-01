import { Overlay, Container, Title, Button } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { Link } from '@remix-run/react';
import HeaderSimple from '../components/headersimple';
import classes from '../styles/index.module.css';

export default function Index() {
  const [ctaButtonClicked, toggle] = useToggle([false, true]);

  return (
    <div className={classes.hero}>
      <HeaderSimple />
      <Overlay
        gradient='linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, .65) 40%)'
        opacity={1}
        zIndex={0}
      />
      <Container className={classes.container}>
        <Title order={1} className={classes.title}>
          Grow your events with organic marketing
        </Title>
        <Title order={2} className={classes.description} mt='xl'>
          We use social media to grow your events exponetially.
        </Title>
        <Title order={2} className={classes.description} mt='xl'>
          With our affiliate marketing, users promote your events and earn a
          commission on each ticket sold, at no cost to you.
        </Title>
        <Button
          variant='outline'
          style={{ backgroundColor: 'black' }}
          size='xl'
          radius='xl'
          color='violet'
          className={classes.control}
          loading={ctaButtonClicked}
          onClick={() => toggle()}>
          <Link prefetch='intent' to='/signup'>
            Free to use. Forever.
          </Link>
        </Button>
      </Container>
    </div>
  );
}
