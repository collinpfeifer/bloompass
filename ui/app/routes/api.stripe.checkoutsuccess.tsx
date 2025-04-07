import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { getCheckoutSession } from "~/models/stripe.server";

export const loader = async ({ request }: LoaderArgs) => {
  let params = new URLSearchParams(request.url.split("?")[1]);
  const sessionId = params.get("session_id");
  if (!sessionId) throw new Error("No session id provided");
  const session = await getCheckoutSession(sessionId);
  if (session.payment_status === "paid") {
    return redirect(
      `${process.env.BASE_URL}/passes/${session.metadata.passId}`
    );
  }
  return json({});
};
