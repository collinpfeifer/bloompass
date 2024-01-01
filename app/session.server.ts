import { createCookieSessionStorage, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import prisma from './utils/prisma.server';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const storage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

// export async function getUserSession(request: Request) {
//   const cookie = request.headers.get('Cookie');
//   return await userSessionStorage.getSession(cookie);
// }

export async function createSession({
  userId,
  redirectTo,
}: {
  userId: string;
  redirectTo: string | undefined;
}) {
  const session = await storage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo || '/feed', {
    headers: {
      'Set-Cookie': await storage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7,
      }),
    },
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await requireUserId(request, redirectTo);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== 'string') {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}
