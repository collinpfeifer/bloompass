import {
  redirect,
  type ActionFunctionArgs,
  ActionFunction,
} from '@remix-run/node';

import { logout } from '../session.server';

export const loader = async () => redirect('/');

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) =>
  await logout(request);
