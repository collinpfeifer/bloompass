import { json } from '@remix-run/node';
import prisma from '../utils/prisma.server';
import bcrypt from 'bcryptjs';

export async function signUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) {
    return json(
      { error: `User already exists with that email`, user: null },
      { status: 400 }
    );
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });

  if (!user) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        user: null,
      },
      { status: 400 }
    );
  }
  return json(
    { user: { id: user.id, email: user.email }, error: null },
    { status: 201 }
  );
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return json(
      { error: `No user found with that email address`, user: null },
      { status: 400 }
    );
  }
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return json({ user: null, error: `Invalid password` }, { status: 400 });
  }
  return json({
    user: { id: user.id, email: user.email, banned: user.banned },
    error: null,
  });
}

export async function getUserById({ id }: { id: string }) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return json(user);
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  return json(users);
}

export async function updateUser({
  id,
  email,
  stripeAccountId,
  onboardingComplete,
  banned,
  pendingChargeIds,
}: {
  id: string;
  email?: string;
  stripeAccountId?: string;
  onboardingComplete?: boolean;
  banned?: boolean;
  pendingChargeIds?: string[];
}) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      email,
      stripeAccountId,
      onboardingComplete,
      banned,
      pendingChargeIds,
    },
  });
  if (!user) {
    return json({ error: `No user found with that id` }, { status: 400 });
  }
  return json({
    id: user.id,
    email: user.email,
    stripeAccountId: user.stripeAccountId,
    onboardingComplete: user.onboardingComplete,
    banned: user.banned,
  });
}
