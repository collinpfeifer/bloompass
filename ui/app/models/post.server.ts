import {
  getOrganization,
  getOrganizationAccessToken,
  getOrganizationId,
} from "~/session.server";
import {
  deleteOrganizationImage,
  getImage,
  uploadOrganizationImage,
} from "./image.server";
import { getLinksByPostId } from "./link.server";

const fetch = require("fetch-retry")(global.fetch);

export const createPost = async ({
  request,
  title,
  date_time,
  address,
  price,
  image,
}: {
  request: Request;
  title: string;
  date_time: string;
  address: string;
  price: string;
  image: FormData;
}) => {
  const organization = await getOrganization(request);
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const imageResponse = await uploadOrganizationImage({ request, image });
  const response = await fetch(`${process.env.POST_API_GATEWAY}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
    body: JSON.stringify({
      title,
      date_time,
      address,
      price,
      organization_id: organization.id,
      organization_stripe_account_id: organization.stripeAccountId,
      image: imageResponse.imageId,
    }),
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  console.log(response);
  return response;
};

export const getPost = async ({
  request,
  id,
}: {
  request: Request;
  id: string;
}) => {
  // check if org is logged in, then check if same org as post, if so then get stats of affiliate links
  const organizationId = await getOrganizationId(request);
  const post = await fetch(`${process.env.POST_API_GATEWAY}/posts/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res: any) => res.json())
    .catch((err: any) => console.log(err));
  const image = await getImage(post.image);
  post.imageId = post.image;
  post.image = image;
  if (post.organization_id === organizationId) {
    const links = await getLinksByPostId({ request, postId: id });
    const stats = {
      affiliateClicks: 0,
      affiliateSales: 0,
    };
    for (const link of links) {
      stats.affiliateClicks += link.clicks;
      stats.affiliateSales += link.sales;
    }
    post.affiliate_clicks = stats.affiliateClicks;
    post.affiliate_sales = stats.affiliateSales;
  }
  return post;
};

export const getPosts = async (request: Request) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  const posts = await fetch(`${process.env.POST_API_GATEWAY}/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
  })
    .then((res: any) => res.json())
    .catch((err: any) => console.log(err));
  for (const post of posts) {
    const image = await getImage(post.image);
    post.imageId = post.image;
    post.image = image;
    const links = await getLinksByPostId({ request, postId: post.id });
    const stats = {
      affiliateClicks: 0,
      affiliateSales: 0,
    };
    for (const link of links) {
      stats.affiliateClicks += link.clicks;
      stats.affiliateSales += link.sales;
    }
    post.affiliate_clicks = stats.affiliateClicks;
    post.affiliate_sales = stats.affiliateSales;
  }
  return posts;
};

export const updatePost = async ({
  request,
  id,
  title,
  date_time,
  address,
  price,
  organization_id,
  organization_stripe_account_id,
  image,
}: {
  request: Request;
  id: string;
  title: string;
  date_time: string;
  address: string;
  price: string;
  organization_id: string;
  organization_stripe_account_id: string;
  image: FormData;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  if (image) {
    const { image: oldImage } = await getPost({ request, id });
    await deleteOrganizationImage({ request, id: oldImage });
    const imageResponse = await uploadOrganizationImage({ request, image });
    image = imageResponse.image_id;
  }
  const response = await fetch(`${process.env.POST_API_GATEWAY}/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authgorization: `Bearer ${organizationAccessToken}`,
    },
    body: JSON.stringify({
      title,
      date_time,
      address,
      price,
      organization_id,
      organization_stripe_account_id,
      image,
    }),
  })
    .then((res: any) => res.json())
    .catch((err: any) => console.log(err));
  return response;
};

export const deletePost = async ({
  request,
  id,
}: {
  request: Request;
  id: string;
}) => {
  const organizationAccessToken = await getOrganizationAccessToken(request);
  await fetch(`${process.env.POST_API_GATEWAY}/posts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${organizationAccessToken}`,
    },
  })
    .then((res: any) => res.json())
    .catch((err: any) => console.log(err));
};

export const buyPost = async ({
  title,
  price,
  organizationStripeId,
  cancelUrl,
  address,
  dateTime,
  postId,
}: {
  title: string;
  price: string;
  organizationStripeId: string;
  cancelUrl?: string;
  address: string;
  dateTime: string;
  postId: string;
}) => {
  return await fetch(
    `/api/stripe/checkoutsessions?name=${title}&price=${price}&organizationStripeId=${organizationStripeId}${
      cancelUrl ? `&cancelUrl=${cancelUrl}` : ""
    }&address=${address}&dateTime=${dateTime}&postId=${postId}`
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
};
