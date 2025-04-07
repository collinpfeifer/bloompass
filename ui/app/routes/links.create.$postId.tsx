import {
  Flex,
  Paper,
  Stack,
  Image,
  Button,
  ActionIcon,
  CopyButton,
  Text,
  Tooltip,
} from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import invariant from "tiny-invariant";
import { createLink } from "~/models/link.server";
import { getPost } from "~/models/post.server";
import { getUser } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user) {
    return redirect(`/user/join?redirect=/links/create/${params.postId}`);
  } else {
    invariant(params.postId, "postId is required");
    const link = await createLink({
      request,
      userId: user.id,
      postId: params.postId,
      userStripeAccountId: user.stripeAccountId,
    });
    const post = await getPost({ request, id: params.postId });
    return json({ link, post, baseUrl: process.env.BASE_URL });
  }
};

export default function CreateLink() {
  const { post, link, baseUrl } = useLoaderData<typeof loader>();
  return (
    <Paper radius="md" maw="100%" p={10}>
      <Stack>
        <Image src={post.image} h="auto" mx="auto" maw={550} />
        <Flex justify="space-around" wrap="wrap">
          <Button
            onClick={async () => {
              if (navigator.canShare() && post.image != null)
                try {
                  fetch(post.image)
                    .then((res) => res.blob())
                    .then(async (blob) => {
                      const file = new File([blob], "File name", {
                        type: "image/png",
                      });
                      await navigator.share({
                        title: "Advertisement",
                        text: "Advertisement",
                        files: [file],
                      });
                    });
                } catch (error: any) {}
            }}
          >
            Download Image
          </Button>
          <Flex
            bg="gray"
            wrap="nowrap"
            m={1}
            p={2}
            justify="space-between"
            maw={350}
          >
            <Text m={3} lineClamp={1}>
              {baseUrl && link ? `${baseUrl}/links/${link.id}` : ""}
            </Text>
            <CopyButton
              value={link && baseUrl ? `${baseUrl}/links/${link.id}` : ""}
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : "Copy"}
                  withArrow
                  position="right"
                >
                  <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                    {copied ? (
                      <IconCheck size="1rem" />
                    ) : (
                      <IconCopy size="1rem" />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Flex>
        </Flex>
        <Text m="auto">
          Share your link through social media or with your friends
        </Text>
        <Text m="auto">
          $0.01 per click on your link, $1 on each purchase through your link
        </Text>
      </Stack>
    </Paper>
  );
}
