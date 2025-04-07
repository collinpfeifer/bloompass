import { redirect, type ActionArgs } from "@remix-run/node";

import { organizationLogout } from "~/session.server";

export const loader = async () => redirect("/");

export const action = async ({ request }: ActionArgs) =>
  await organizationLogout(request);
