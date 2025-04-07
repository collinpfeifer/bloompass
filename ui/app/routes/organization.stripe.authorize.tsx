import { redirect, type LoaderArgs } from "@remix-run/node";
import { getOrganization, getOrganizationAccessToken } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = searchParams.get("redirectTo");
  const organization = await getOrganization(request);
  const accessToken = await getOrganizationAccessToken(request);
  if (organization.onboardingComplete)
    return redirect(redirectTo || "/organization");
  let accountParams = {};
  let accountId = organization.stripeAccountId;
  if (!accountId) {
    accountParams = {
      type: "express",
      country: "US",
    };

    const account = await fetch(`${process.env.STRIPE_API_GATEWAY}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(accountParams),
    });
    const data = await account.json();
    accountId = data.id;
    await fetch(
      `${process.env.ORGANIZATION_API_GATEWAY}/organizations/${organization.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ stripeAccountId: accountId }),
      }
    );
  }

  const accountLink = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/accountLinks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        account: accountId,
        refreshUrl: `${process.env.BASE_URL}/organization/stripe/authorize`,
        returnUrl: `${process.env.BASE_URL}/organization/stripe/onboarded?redirectTo=${redirectTo}`,
      }),
    }
  ).then((res) => res.json());

  return redirect(accountLink.url);
};
