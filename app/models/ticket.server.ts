import { json } from '@remix-run/node';
import prisma from '../utils/prisma.server';
import { requireUserId } from '../session.server';
import { Hashtag } from '@prisma/client';

export async function createTicket({
  request,
  title,
  description,
  price,
  dateTime,
  link,
  hashtags,
  newHashtags,
}: {
  request: Request;
  title: string;
  price: number;
  dateTime: string;
  link: string;
  description: string;
  hashtags: Hashtag[];
  newHashtags: Hashtag[];
}) {
  const userId = await requireUserId(request);
  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      price,
      dateTime,
      link,
      sellerUserId: userId,
      hashtags: {
        connect: [...hashtags.map((hashtag) => ({ id: hashtag.id }))],
        create: [...newHashtags.map((hashtag) => ({ title: hashtag.title }))],
      },
    },
  });
  return json(ticket);
}

export async function getTicket({ id }: { id: string }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { hashtags: true },
  });
  return json(ticket);
}

export async function getTickets() {
  const tickets = await prisma.ticket.findMany({
    where: {
      buyerUserId: null,
    },
    include: { hashtags: true },
  });
  return json(tickets);
}

export async function searchTicketsByQuery({ query }: { query: string }) {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      dateTime: 'desc',
    },
    where: {
      buyerUserId: null,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          hashtags: {
            some: {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    },
    include: { hashtags: true },
  });
  return json(tickets);
}

// export async function searchTicketsByHashtags({
//   hashtags,
// }: {
//   hashtags: string[];
// }) {
//   const tickets = await prisma.ticket.findMany({
//     orderBy: {
//       dateTime: 'desc',
//     },
//     where: {
//       hashtags: {
//         some: {
//           title: {
//             in: hashtags,
//           },
//         },
//       },
//     },
//     include: { hashtags: true },
//   });
//   return json(tickets);
// }

// export async function searchTicketsByQueryAndHashtags({
//   query,
//   hashtags,
// }: {
//   query: string;
//   hashtags: string[];
// }) {
//   const tickets = await prisma.ticket.findMany({
//     orderBy: {
//       dateTime: 'desc',
//     },
//     where: {
//       AND: [
//         {
//           OR: [
//             {
//               title: {
//                 contains: query,
//                 mode: 'insensitive',
//               },
//             },
//             {
//               description: {
//                 contains: query,
//                 mode: 'insensitive',
//               },
//             },
//           ],
//         },
//         {
//           hashtags: {
//             some: {
//               title: {
//                 in: hashtags,
//               },
//             },
//           },
//         },
//       ],
//     },
//     include: { hashtags: true },
//   });
//   return json(tickets);
// }

export async function updateTicket({
  id,
  title,
  sold,
  soldAt,
  description,
  hashtags,
  buyerUserId,
  newHashtags,
}: {
  id: string;
  sold: boolean | undefined;
  soldAt: string | undefined;
  title: string | undefined;
  description: string | undefined;
  buyerUserId: string | undefined;
  hashtags: Hashtag[] | undefined;
  newHashtags: Hashtag[] | undefined;
}) {
  if (hashtags && newHashtags) {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        title,
        sold,
        soldAt,
        description,
        buyerUserId,
        hashtags: {
          connect: [...hashtags.map((hashtag) => ({ id: hashtag.id }))],
          create: [...newHashtags.map((hashtag) => ({ title: hashtag.title }))],
        },
      },
    });
    return json(ticket);
  } else if (hashtags) {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        title,
        sold,
        soldAt,
        description,
        buyerUserId,
        hashtags: {
          connect: [...hashtags.map((hashtag) => ({ id: hashtag.id }))],
        },
      },
    });
    return json(ticket);
  } else if (newHashtags) {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        title,
        sold,
        soldAt,
        description,
        buyerUserId,
        hashtags: {
          create: [...newHashtags.map((hashtag) => ({ title: hashtag.title }))],
        },
      },
    });
    return json(ticket);
  } else {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        title,
        sold,
        soldAt,
        description,
        buyerUserId,
      },
    });
    return json(ticket);
  }
}

export async function getSellingTicketsByUserId({
  userId,
}: {
  userId: string;
}) {
  const tickets = await prisma.ticket.findMany({
    where: { sellerUserId: userId },
    include: { hashtags: true },
  });
  return json(tickets);
}

export async function getBoughtTicketsByUserId({ userId }: { userId: string }) {
  const tickets = await prisma.ticket.findMany({
    where: { buyerUserId: userId },
    include: { hashtags: true },
  });
  return json(tickets);
}
