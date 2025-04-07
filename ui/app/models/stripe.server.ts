import {
  getOrganizationAccessToken,
  getUserAccessToken,
} from "~/session.server";

const fetch = require("fetch-retry")(global.fetch);

export const getCheckoutSession = async (id: string) => {
  const response = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/stripe/checkoutsessions/${id}`,
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

export const getLoginLink = async (stripeAccountId: string) => {
  const response = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/stripe/login/links`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: stripeAccountId,
      }),
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const addClick = async (id: string) => {
  const response = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/stripe/links/${id}/clicks`,
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

export const createUserStripeAccount = async ({
  request,
  accountParams,
}: {
  request: Request;
  accountParams: Object;
}) => {
  const accessToken = await getUserAccessToken(request);
  const account = await fetch(`${process.env.STRIPE_API_GATEWAY}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(accountParams),
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return account;
};

export const getUserStripeAccount = async ({
  request,
  accountId,
}: {
  request: Request;
  accountId: string;
}) => {
  const userAccessToken = await getUserAccessToken(request);
  const account = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/accounts/${accountId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return account;
};

export const createOrganizationStripeAccount = async ({
  request,
  accountParams,
}: {
  request: Request;
  accountParams: Object;
}) => {
  const accessToken = await getOrganizationAccessToken(request);
  const account = await fetch(`${process.env.STRIPE_API_GATEWAY}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(accountParams),
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return account;
};

export const getOrganizationStripeAccount = async ({
  request,
  accountId,
}: {
  request: Request;
  accountId: string;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const account = await fetch(
    `${process.env.STRIPE_API_GATEWAY}/accounts/${accountId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizationAccessToken}`,
      },
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return account;
};

export const createCheckoutSession = async ({
  postId,
  cancelUrl,
  linkId,
  userId,
}: {
  postId: FormDataEntryValue | string | null;
  cancelUrl?: FormDataEntryValue | string | null;
  linkId?: FormDataEntryValue | string | null;
  userId?: FormDataEntryValue | string | null;
}) => {
  return await fetch(
    `${process.env.STRIPE_API_GATEWAY}/stripe/checkoutsessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        postId,
        linkId,
        successUrl: `${process.env.BASE_URL}/api/stripe/checkoutsuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: cancelUrl
          ? `${process.env.BASE_URL}${cancelUrl}`
          : `${process.env.BASE_URL}/posts`,
      }),
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};
