import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider, Stack, createTheme } from '@mantine/core';
import { cssBundleHref } from '@remix-run/css-bundle';
import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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

export default function App() {
  // const navigation = useNavigation();
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
          <Stack
            align='center'
            justify='center'
            style={() => ({
              background:
                'linear-gradient(45deg, rgba(27,29,84,1) 0%, rgba(69,252,141,1) 100%)',
              minHeight: '100dvh',

              backgroundAttachment: 'fixed',
            })}>
            {/* {navigation.state !== 'idle' ? <Loader color='blue' /> : null} */}
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
