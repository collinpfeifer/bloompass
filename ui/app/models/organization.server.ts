import {
  getOrganizationAccessToken,
  getOrganizationRefreshToken,
} from "~/session.server";

const fetch = require("fetch-retry")(global.fetch);

export const signUpOrganization = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/auth/signup`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );
  return await response.json();
};

export const getOrganizationById = async (request: Request, id: string) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/organizations/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizationAccessToken}`,
      },
    }
  );
  return await response.json();
};

export const loginOrganization = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/auth/login`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
  const data = await response.json();
  console.log(data);
  return data;
};

export const updateOrganization = async ({
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
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/organizations/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizationAccessToken}`,
      },
      body: JSON.stringify({
        name,
        image,
        phoneNumber,
        password,
        onboardingComplete,
      }),
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const deleteOrganization = async (request: Request, id: string) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/organizations/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizationAccessToken}`,
      },
    }
  );
  return await response.json();
};

export const logoutOrganization = async (request: Request) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  await fetch(`${process.env.ORGANIZATION_API_GATEWAY}/auth/logout`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
  });
};

export const refreshOrganizationToken = async (request: Request) => {
  const organizationRefreshToken = await getOrganizationRefreshToken(request);
  const response = await fetch(
    `${process.env.ORGANIZATION_API_GATEWAY}/auth/refresh`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizationRefreshToken}`,
      },
    }
  );
  return await response.json();
};
