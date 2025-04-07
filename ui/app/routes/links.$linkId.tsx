import { redirect, type LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getLink } from "~/models/link.server";
import { addClick } from "~/models/stripe.server";
import { getOrganizationId, getUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.linkId, "linkId is required");
  const link = await getLink(params.linkId);
  const userId = await getUserId(request);
  const organizationId = await getOrganizationId(request);
  if (!organizationId && userId !== link.userId) {
    await addClick(link.id);
  }
  return redirect(
    `${process.env.BASE_URL}/posts/${link.postId}?affiliateStripeAccountId=${link.userStripeAccountId}?linkId=${link.id}`
  );
};
