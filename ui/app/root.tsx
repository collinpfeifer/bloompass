import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import { cssBundleHref } from "@remix-run/css-bundle";
import stylesheet from "~/tailwind.css";
import { Stack, MantineProvider, createEmotionCache } from "@mantine/core";
import { StylesPlaceholder } from "@mantine/remix";
import { Notifications } from "@mantine/notifications";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { theme } from "./theme";

export const meta: V2_MetaFunction = () => {
  return [
    { name: "charset", content: "utf-8" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { name: "description", content: "Bloompass.io" },
    { name: "title", content: "Bloompass.io" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

createEmotionCache({ key: "mantine" });

export default function App() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <html lang="en">
        <head>
          <StylesPlaceholder />
          <Meta />
          <Links />
        </head>
        <body>
          <Notifications />
          <Stack
            align="center"
            justify="center"
            sx={(theme) => ({
              background: theme.fn.gradient(),
              minHeight: "100dvh",
              height: "100%",
              backgroundAttachment: "fixed",
            })}
          >
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </Stack>
        </body>
      </html>
    </MantineProvider>
  );
}
