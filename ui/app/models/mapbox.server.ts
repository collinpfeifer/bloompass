import { AddressAutofillCore, SearchSession } from "@mapbox/search-js-core";
import invariant from "tiny-invariant";

invariant(process.env.MAPBOX_TOKEN, "MAPBOX_TOKEN must be set");

const search = new AddressAutofillCore({
  accessToken: process.env.MAPBOX_TOKEN,
});

const session = new SearchSession(search);

export const searchAddress = async (address: string) => {
  return await session.suggest(address, {
    language: "en",
    country: "us",
    limit: 5,
  });
};
