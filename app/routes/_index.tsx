import { Overlay, Container, Title, Button } from '@mantine/core';
import { Link } from '@remix-run/react';
import HeaderSimple from '../components/headersimple';
import classes from '../styles/index.module.css';
import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => [{ title: 'Bloompass' }];

export default function Index() {
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
          Resell your tickets to other true fans.
        </Title>
        <Title order={2} className={classes.description} mt='xl'>
          Bloompass is what ticketing should be. We&apos;re a ticketing
          platform, with a $1 fee, and Stripe fees, that&apos;s it. We offer refunds for
          tickets that don&apos;t work, banning of scammers, and the ultimate selection of second-hand tickets.
        </Title>
        <Title order={2} className={classes.description} mt='xl'>
          We&apos;re currently in beta. Sign up to get early access.
        </Title>
        <Button
          variant='outline'
          style={{ backgroundColor: 'black' }}
          size='xl'
          radius='xl'
          color='violet'
          className={classes.control}>
          <Link
            prefetch='intent'
            to='/signup'
            style={{ textDecoration: 'none', color: 'white' }}>
            Sign up for early access
          </Link>
        </Button>
      </Container>
    </div>
  );
}
