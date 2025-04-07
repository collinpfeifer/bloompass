import { Stack } from "@mantine/core";
import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getLinks } from "~/models/link.server";
import Link from "../components/link";

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const links = await getLinks(request);
  return json({ links, baseUrl: process.env.BASE_URL });
};

export default function Links() {
  const { links, baseUrl } = useLoaderData<typeof loader>();
  return (
    <Stack>
      {links.map((link: any) => (
        <Link
          key={link.id}
          title={link.title}
          buys={link.buys}
          payPerBuy={1}
          clicks={link.clicks}
          payPerClick={0.01}
          linkId={link.id}
          image={link.image}
          baseUrl={baseUrl}
        />
      ))}
    </Stack>
  );
}
