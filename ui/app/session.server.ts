import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import * as jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

import {
  getUserById,
  logoutUser,
  refreshUserToken,
} from "~/models/user.server";
import {
  getOrganizationById,
  logoutOrganization,
  refreshOrganizationToken,
} from "~/models/organization.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const userSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "user",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const organizationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "organization",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const ORGANIZATION_ACCESS_TOKEN = "organizationAccessToken";
const ORGANIZATION_REFRESH_TOKEN = "organizationRefreshToken";

const USER_ACCESS_TOKEN = "userAccessToken";
const USER_REFRESH_TOKEN = "userRefreshToken";

export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return await userSessionStorage.getSession(cookie);
}

export async function getOrganizationSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return await organizationSessionStorage.getSession(cookie);
}

export async function getOrganizationAccessToken(request: Request) {
  const session = await getOrganizationSession(request);
  const accessToken = await session.get(ORGANIZATION_ACCESS_TOKEN);
  if (!accessToken) return undefined;
  try {
    const client = new JwksClient({
      jwksUri:
        "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    });

    const key = await client.getSigningKey(process.env.JWT_KID_2);
    const data = jwt.verify(accessToken, key.getPublicKey());
    if (typeof data === "string") return undefined;
    return accessToken;
  } catch (exception: any) {
    if (exception.name === "TokenExpiredError") {
      const { accessToken, refreshToken } = await refreshOrganizationToken(
        request
      );
      const session = await getOrganizationSession(request);
      session.set(ORGANIZATION_ACCESS_TOKEN, accessToken);
      session.set(ORGANIZATION_REFRESH_TOKEN, refreshToken);
      return accessToken;
    }
  }
}

export async function getOrganizationRefreshToken(request: Request) {
  const session = await getOrganizationSession(request);
  const refreshToken = await session.get(ORGANIZATION_REFRESH_TOKEN);
  if (!refreshToken) return undefined;
  try {
    const client = new JwksClient({
      jwksUri:
        "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    });
    const key = await client.getSigningKey(process.env.JWT_KID_2);
    const data = jwt.verify(refreshToken, key.getPublicKey());
    if (typeof data === "string") return undefined;
    return refreshToken;
  } catch (exception: any) {
    if (exception.name === "TokenExpiredError") {
      await organizationLogout(request);
    }
  }
}

export async function getOrganizationId(
  request: Request
): Promise<string | undefined> {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  if (!organizationAccessToken) return undefined;
  const client = new JwksClient({
    jwksUri:
      "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
    requestHeaders: {}, // Optional
    timeout: 30000, // Defaults to 30s
  });

  const key = await client.getSigningKey(process.env.JWT_KID_2);
  const data = jwt.verify(organizationAccessToken, key.getPublicKey());
  if (typeof data === "string") return undefined;
  return data.sub;
}

export async function getUserAccessToken(request: Request) {
  const session = await getUserSession(request);
  const accessToken = await session.get(USER_ACCESS_TOKEN);
  if (!accessToken) return undefined;
  try {
    const client = new JwksClient({
      jwksUri:
        "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    });

    const key = await client.getSigningKey(process.env.JWT_KID);
    const data = jwt.verify(accessToken, key.getPublicKey());
    if (typeof data === "string") return undefined;
    return accessToken;
  } catch (exception: any) {
    if (exception.name === "TokenExpiredError") {
      const { accessToken, refreshToken } = await refreshUserToken(request);
      const session = await getUserSession(request);
      session.set(USER_ACCESS_TOKEN, accessToken);
      session.set(USER_REFRESH_TOKEN, refreshToken);
      return accessToken;
    }
  }
}

export async function getUserRefreshToken(request: Request) {
  const session = await getUserSession(request);
  const refreshToken = await session.get(USER_REFRESH_TOKEN);
  if (!refreshToken) return undefined;
  try {
    const client = new JwksClient({
      jwksUri:
        "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    });

    const key = await client.getSigningKey(process.env.JWT_KID);
    const data = jwt.verify(refreshToken, key.getPublicKey());
    if (typeof data === "string") return undefined;
    return refreshToken;
  } catch (exception: any) {
    if (exception.name === "TokenExpiredError") {
      await userLogout(request);
    }
  }
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const userAccessToken = await getUserAccessToken(request);
  if (!userAccessToken) return undefined;
  const client = new JwksClient({
    jwksUri:
      "https://www.googleapis.com/service_accounts/v1/jwk/adfluent-api-gateway-auth@adfluent.iam.gserviceaccount.com",
    requestHeaders: {}, // Optional
    timeout: 30000, // Defaults to 30s
  });

  const key = await client.getSigningKey(process.env.JWT_KID);
  const data = jwt.verify(userAccessToken, key.getPublicKey());
  if (typeof data === "string") return undefined;
  return data.sub;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await getUserById(request, userId);
  if (user) return user;

  throw await userLogout(request);
}

export async function getOrganization(request: Request) {
  const organizationId = await getOrganizationId(request);
  if (!organizationId) return null;

  const organization = await getOrganizationById(request, organizationId);
  if (organization) return organization;

  throw await organizationLogout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/user/join?${searchParams}`);
  }
  return userId;
}

export async function requireOrganizationId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const organizationId = await getOrganizationId(request);
  if (!organizationId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/user/join?${searchParams}`);
  }
  return organizationId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(request, userId);
  if (user) return user;

  throw await userLogout(request);
}

export async function createUserSession({
  request,
  accessToken,
  refreshToken,
  remember,
  redirectTo,
}: {
  request: Request;
  accessToken: string;
  remember: boolean;
  refreshToken: string;
  redirectTo: string;
}) {
  const session = await getUserSession(request);
  session.set(USER_ACCESS_TOKEN, accessToken);
  session.set(USER_REFRESH_TOKEN, refreshToken);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function createOrganizationSession({
  request,
  accessToken,
  refreshToken,
  remember,
  redirectTo,
}: {
  request: Request;
  accessToken: string;
  remember: boolean;
  refreshToken: string;
  redirectTo: string;
}) {
  const session = await getOrganizationSession(request);
  session.set(ORGANIZATION_ACCESS_TOKEN, accessToken);
  session.set(ORGANIZATION_REFRESH_TOKEN, refreshToken);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await organizationSessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function userLogout(request: Request) {
  const session = await getUserSession(request);
  await logoutUser(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await userSessionStorage.destroySession(session),
    },
  });
}

export async function organizationLogout(request: Request) {
  const session = await getOrganizationSession(request);
  await logoutOrganization(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await organizationSessionStorage.destroySession(session),
    },
  });
}
