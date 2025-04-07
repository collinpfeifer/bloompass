import { Center } from "@mantine/core";
import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ArticleCardImage } from "~/components/backgroundcard";
import { getPost } from "~/models/post.server";
import { getOrganizationId } from "~/session.server";

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderArgs) => {
  let searchParams = new URLSearchParams(request.url.split("?")[1]);
  const affiliateStripeAccountId = searchParams.get("affiliateStripeAccountId");
  const linkId = searchParams.get("linkId");
  const organizationId = await getOrganizationId(request);
  invariant(params.postId, "postId not found");
  const post = await getPost({ request, id: params.postId });
  return json({ post, affiliateStripeAccountId, organizationId, linkId });
};
export default function PostsIndex() {
  const { post, affiliateStripeAccountId, linkId, organizationId } =
    useLoaderData<typeof loader>();
  return (
    <Center>
      <ArticleCardImage
        key={post.id}
        title={post.title}
        cancelUrl={`/posts/${post.id}`}
        organizationStripeId={post.organization_stripe_account_id}
        postId={post.id}
        dateTime={post.date_time}
        sales={post.sales}
        clicks={post.clicks}
        affiliateSales={post.affiliate_sales}
        affiliateClicks={post.affiliate_clicks}
        address={post.address}
        price={post.price}
        image={post.image}
        linkId={linkId}
        affiliateStripeAccountId={affiliateStripeAccountId}
        postOrganizationId={post.organization_id}
        organizationId={organizationId}
      />
    </Center>
  );
}
