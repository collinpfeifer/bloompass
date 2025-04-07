import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { searchAddress } from "~/models/mapbox.server";

export const loader = async ({ request }: LoaderArgs) => {
  const address = new URL(request.url).searchParams.get("address");
  if (!address) return json({});
  const suggestions = (await searchAddress(address)).suggestions;
  const filtered = suggestions.map((item) => ({
    ...item,
    value: item.full_address,
  }));
  return json(filtered);
};
