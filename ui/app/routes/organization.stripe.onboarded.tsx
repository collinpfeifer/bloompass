import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { updateOrganization } from "~/models/organization.server";
import { getOrganizationStripeAccount } from "~/models/stripe.server";
import { getOrganization } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const organization = await getOrganization(request);
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = searchParams.get("redirectTo");
  const account = await getOrganizationStripeAccount({
    request,
    accountId: organization.stripeAccountId,
  });

  if (account.details_submitted) {
    await updateOrganization({
      request,
      id: organization.id,
      onboardingComplete: true,
    });

    return redirect(redirectTo || "/organization");
  } else {
    return redirect("/organization/join");
  }
};
