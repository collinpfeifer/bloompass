import { redirect, type ActionArgs } from "@remix-run/node";
import { createCheckoutSession } from "~/models/stripe.server";

export const action = async ({ request }: ActionArgs) => {
  const formaData = await request.formData();
  const postId = formaData.get("postId");
  const userId = formaData.get("userId");
  const cancelUrl = formaData.get("cancelUrl");
  const linkId = formaData.get("linkId");
  const response = await createCheckoutSession({
    postId,
    userId,
    cancelUrl,
    linkId,
  });
  return redirect(response.url);
};
