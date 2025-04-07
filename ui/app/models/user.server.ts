import { getUserAccessToken, getUserRefreshToken } from "~/session.server";

const fetch = require("fetch-retry")(global.fetch);

export const signUpUser = async ({
  name,
  phoneNumber,
  password,
}: {
  name: string;
  phoneNumber: string;
  password: string;
}) => {
  const response = await fetch(`${process.env.USER_API_GATEWAY}/auth/signup`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phoneNumber,
      password,
    }),
  });
  return await response.json();
};

export const getUserById = async (request: Request, id: string) => {
  const userAccessToken = await getUserAccessToken(request);
  const response = await fetch(`${process.env.USER_API_GATEWAY}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
  });
  return await response.json();
};

export const loginUser = async ({
  phoneNumber,
  password,
}: {
  phoneNumber: string;
  password: string;
}) => {
  const response = await fetch(`${process.env.USER_API_GATEWAY}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber,
      password,
    }),
  });
  const data = await response.json();
  return data;
};

export const updateUser = async ({
  request,
  id,
  name,
  image,
  phoneNumber,
  password,
  onboardingComplete,
}: {
  request: Request;
  id: string;
  name?: string;
  image?: string;
  phoneNumber?: string;
  password?: string;
  onboardingComplete?: boolean;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  const response = await fetch(`${process.env.USER_API_GATEWAY}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
    body: JSON.stringify({
      name,
      image,
      phoneNumber,
      password,
      onboardingComplete,
    }),
  })
    .then((res: any) => res.json())
    .catch((err: any) => console.log(err));
  return response;
};

export const deleteUser = async ({
  request,
  id,
}: {
  request: Request;
  id: string;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  await fetch(`${process.env.USER_API_GATEWAY}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
  });
};

export const logoutUser = async (request: Request) => {
  const userAccessToken = await getUserAccessToken(request);
  await fetch(`${process.env.USER_API_GATEWAY}/auth/logout`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
  });
};

export const refreshUserToken = async (request: Request) => {
  const userRefreshToken = await getUserRefreshToken(request);
  const response = await fetch(`${process.env.USER_API_GATEWAY}/auth/refresh`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userRefreshToken}`,
    },
  }).then((res: any) => res.json());
  return response;
};
