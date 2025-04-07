import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUserStripeAccount } from "~/models/stripe.server";
import { updateUser } from "~/models/user.server";
import { getUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = searchParams.get("redirectTo");
  const data = await getUserStripeAccount({
    request,
    accountId: user.stripeAccountId,
  });
  if (data.details_submitted) {
    await updateUser({ request, id: user.id, onboardingComplete: true });
    return redirect(redirectTo || "/user");
  } else {
    return redirect("/user/join");
  }
};
