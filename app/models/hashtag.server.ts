import { json } from '@remix-run/node';
import prisma from '../utils/prisma.server';
import { requireUserId } from '../session.server';


export async function createHashtag({
  request,
  title,
}: {
  request: Request;
  title: string;
}) {
  await requireUserId(request);
  const hashtag = await prisma.hashtag.create({
    data: {
      title,
    },
  });
  return json(hashtag);
}

export async function getHashtag({ id }: { id: string }) {
  const hashtag = await prisma.hashtag.findUnique({
    where: { id },
  });
  return json(hashtag);
}

export async function getHashtags() {
  const hashtags = await prisma.hashtag.findMany();
  return json(hashtags);
}

export async function getHashtagByTitle({ title }: { title: string }) {
  const hashtag = await prisma.hashtag.findUnique({
    where: { title },
  });
  return json(hashtag);
}

export async function getTicketsByHashtag({ title }: { title: string }) {
  const hashtag = await prisma.hashtag.findUnique({
    where: { title },
    include: { tickets: true },
  });
  return json(hashtag);
}

