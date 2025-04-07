import type { ActionArgs } from "@remix-run/node";
import { scanPass } from "~/models/pass.server";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const data = formData.get("data");
  const postId = formData.get("postId");
  return await scanPass({ data, postId });
};
