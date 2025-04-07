import { redirect, type LoaderArgs } from "@remix-run/node";
import { createUserStripeAccount } from "~/models/stripe.server";
import { getUser, getUserAccessToken } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = searchParams.get("redirectTo");
  const user = await getUser(request);
  const accessToken = await getUserAccessToken(request);
  if (user.onboardingComplete) return redirect(redirectTo || "/user");
  let accountParams = {};
  let accountId = user.stripeAccountId;
  if (!accountId) {
    const firstName = user.name.split(" ")[0];
    const lastName = user.name.split(" ")[1];
    accountParams = {
      type: "express",
      country: "US",
      business_type: "individual",
      individual: {
        first_name: firstName,
        last_name: lastName,
      },
    };

    const data = await createUserStripeAccount({ request, accountParams });
    accountId = data.id;
    await fetch(`${process.env.USER_API_GATEWAY}/user/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ stripeAccountId: accountId }),
    });
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
        refreshUrl: `${process.env.BASE_URL}/user/stripe/authorize`,
        returnUrl: `${process.env.BASE_URL}/user/stripe/onboarded?redirectTo=${redirectTo}`,
      }),
    }
  ).then((res) => res.json());
  return redirect(accountLink.url);
};
