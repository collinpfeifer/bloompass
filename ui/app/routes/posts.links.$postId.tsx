import {
  Paper,
  Stack,
  Flex,
  Button,
  CopyButton,
  Tooltip,
  ActionIcon,
  Text,
  Image,
} from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import invariant from "tiny-invariant";
import { getPost } from "~/models/post.server";
import { getOrganizationId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const organizationId = await getOrganizationId(request);
  if (!organizationId)
    return redirect("/organization/join?redirect=/posts/create");
  const postId = params.postId;
  invariant(postId, "postId is required");
  const post = await getPost({ request, id: postId });
  return json({ post, baseUrl: process.env.BASE_URL });
};

export default function CreatePostLink() {
  const { post, baseUrl } = useLoaderData<typeof loader>();
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
              {baseUrl && post ? `${baseUrl}/posts/${post.id}` : ""}
            </Text>
            <CopyButton
              value={post && baseUrl ? `${baseUrl}/posts/${post.id}` : ""}
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
      </Stack>
    </Paper>
  );
}
