import { ClientProvider } from "@mantine/remix";
import { RemixBrowser } from "@remix-run/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
  document,
  <ClientProvider>
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  </ClientProvider>
);
