import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getLoginLink } from "~/models/stripe.server";
import { getOrganization } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const organization = await getOrganization(request);
  if (organization) {
    const loginLink = await getLoginLink(organization.stripeAccountId);
    return redirect(loginLink.url);
  }
};
