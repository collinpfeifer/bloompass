import {
  getOrganizationAccessToken,
  getUserAccessToken,
} from "~/session.server";

const fetch = require("fetch-retry")(global.fetch);

export const uploadOrganizationImage = async ({
  request,
  image,
}: {
  request: Request;
  image: FormData;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const response = await fetch(
    `${process.env.IMAGE_API_GATEWAY}/images/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${organizationAccessToken}`,
      },
      body: image,
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const uploadUserImage = async ({
  request,
  image,
}: {
  request: Request;
  image: FormData;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  const response = await fetch(
    `${process.env.IMAGE_API_GATEWAY}/images/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
      body: image,
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const getImage = async (id: string) => {
  const { image } = await fetch(
    `${process.env.IMAGE_API_GATEWAY}/images/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return image;
};

export const deleteOrganizationImage = async ({
  request,
  id,
}: {
  request: Request;
  id: string;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  await fetch(`${process.env.IMAGE_API_GATEWAY}/images/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};

export const deleteUserImage = async ({
  request,
  id,
}: {
  request: Request;
  id: string;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  await fetch(`${process.env.IMAGE_API_GATEWAY}/images/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};
