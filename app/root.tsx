import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import {
  Button,
  Container,
  Group,
  MantineProvider,
  Stack,
  Title,
  createTheme,
  Text,
} from '@mantine/core';
import { cssBundleHref } from '@remix-run/css-bundle';
import { Notifications } from '@mantine/notifications';
import classes from './styles/servererror.module.css';
import type { LinksFunction } from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';
import Footer from './components/footer';

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
];

const theme = createTheme({
  defaultGradient: {
    from: '#1b1d54',
    to: '#45fc8d',
    deg: 45,
  },
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
  respectReducedMotion: false,
  white: '#fff',
  black: '#000',
});

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html lang='en'>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <div className={classes.root}>
            <Container>
              <div className={classes.label}>500</div>
              <Title className={classes.title}>
                Something bad just happened...
              </Title>
              <Text size='lg' ta='center' className={classes.description}>
                Our servers could not handle your request. Don&apos;t worry, our
                development team was already notified. Try refreshing the page.
              </Text>
              <Group justify='center'>
                <Button variant='white' size='md'>
                  <Link to='/feed' style={{ textDecoration: 'none' }}>
                    Refresh the page
                  </Link>
                </Button>
              </Group>
            </Container>
          </div>
          <Scripts />
        </MantineProvider>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <Stack
            align='center'
            justify='center'
            style={() => ({
              background:
                'linear-gradient(45deg, rgba(27,29,84,1) 0%, rgba(69,252,141,1) 100%)',
              minHeight: '100dvh',

              backgroundAttachment: 'fixed',
            })}>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </Stack>
          <Footer />
        </MantineProvider>
      </body>
    </html>
  );
}
