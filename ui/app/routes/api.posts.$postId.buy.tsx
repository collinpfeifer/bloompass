import { redirect, type LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createCheckoutSession } from "~/models/stripe.server";

export const loader = async ({ params }: LoaderArgs) => {
  const postId = params.postId;
  invariant(postId, "postId is required");
  const session = await createCheckoutSession({ postId });
  return redirect(session.url);
};
