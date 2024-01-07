import {
  type ActionFunctionArgs,
  ActionFunction,
  LoaderFunction,
  redirect,
} from '@remix-run/node';

import { logout } from '../session.server';

export const loader: LoaderFunction = () => redirect('/');

export const action: ActionFunction = async ({ request }: ActionFunctionArgs) =>
  await logout(request);
