import {
  Paper,
  Stack,
  Group,
  Text,
  ActionIcon,
  CopyButton,
  Flex,
  Tooltip,
  Image,
  Button,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

interface LinkProps {
  title: string;
  buys: number;
  payPerBuy: number;
  clicks: number;
  payPerClick: number;
  linkId: string;
  image: string;
  baseUrl: string;
}

export default function Link({
  title,
  buys,
  payPerBuy,
  clicks,
  payPerClick,
  linkId,
  baseUrl,
  image,
}: LinkProps) {
  return (
    <Paper>
      <Stack>
        <Text>{title}</Text>
        <Group>
          <div>
            <Text>{`Buys: ${buys}`}</Text>
            <Text>{`Clicks: ${clicks}`}</Text>
            <Text>{`Pay: ${buys * payPerBuy + clicks * payPerClick}`}</Text>
          </div>
        </Group>
        <Flex
          bg="gray"
          wrap="nowrap"
          m={1}
          p={2}
          justify="space-between"
          maw={350}
        >
          <Text m={3} lineClamp={1}>
            {baseUrl && linkId ? `${baseUrl}/links/${linkId}` : ""}
          </Text>
          <CopyButton
            value={linkId && baseUrl ? `${baseUrl}/links/${linkId}` : ""}
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
        <Image src={image} h="auto" mx="auto" maw={550} />
        <Button
          onClick={async () => {
            if (navigator.canShare() && image != null)
              try {
                fetch(image)
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
      </Stack>
    </Paper>
  );
}
