import { Stack } from "@mantine/core";
import { redirect, type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ArticleCardImage } from "~/components/backgroundcard";
import { getPosts } from "~/models/post.server";
import { getOrganizationId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const organizationId = await getOrganizationId(request);
  if (!organizationId) return redirect("/");
  const posts = await getPosts(request);
  return json({ posts, organizationId });
};

export default function PostsIndex() {
  const { posts, organizationId } = useLoaderData<typeof loader>();
  return (
    <Stack align="center">
      {posts.map((post: any) => (
        <ArticleCardImage
          key={post.id}
          postOrganizationId={post.organization_id}
          organizationId={organizationId}
          organizationStripeId={post.organization_stripe_account_id}
          sales={post.sales}
          clicks={post.clicks}
          affiliateSales={post.affiliate_sales}
          affiliateClicks={post.affiliate_clicks}
          postId={post.id}
          title={post.title}
          dateTime={post.date_time}
          address={post.address}
          price={post.price}
          image={post.image}
        />
      ))}
    </Stack>
  );
}
