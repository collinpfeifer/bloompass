import {
  getOrganizationAccessToken,
  getUserAccessToken,
} from "~/session.server";

const fetch = require("fetch-retry")(global.fetch);

export const createLink = async ({
  request,
  userId,
  postId,
  userStripeAccountId,
}: {
  request: Request;
  userId: string;
  postId: string;
  userStripeAccountId: string;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  const response = await fetch(`${process.env.LINK_API_GATEWAY}/links`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
    body: JSON.stringify({
      userId,
      postId,
      userStripeAccountId,
    }),
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const getLink = async (linkId: string) => {
  const response = await fetch(
    `${process.env.LINK_API_GATEWAY}/links/${linkId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const getLinks = async (request: Request) => {
  const userAccessToken = await getUserAccessToken(request);
  return await fetch(`${process.env.LINK_API_GATEWAY}/links`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};

export const getLinksByPostId = async ({
  request,
  postId,
}: {
  request: Request;
  postId: string;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  return await fetch(`${process.env.LINK_API_GATEWAY}/links/posts/${postId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};
