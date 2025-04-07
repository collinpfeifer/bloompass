import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser } from "~/session.server";
import { getLoginLink } from "~/models/stripe.server";

export const action = async ({ request }: ActionArgs) => {
  const user = await getUser(request);
  if (user) {
    const loginLink = await getLoginLink(user.stripeAccountId);
    return redirect(loginLink.url);
  }
};
