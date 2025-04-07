import {
  createStyles,
  Paper,
  Text,
  Title,
  Button,
  rem,
  Flex,
  Stack,
  Image,
  Group,
  Menu,
  Progress,
  SimpleGrid,
  Box,
  Modal,
} from "@mantine/core";
import {
  IconSettings,
  IconGraph,
  IconDeviceAnalytics,
  IconShare,
  IconQrcode,
} from "@tabler/icons-react";
import { Form, Link } from "@remix-run/react";
import { convertDateString } from "~/utils";
import ReactCardFlip from "react-card-flip";
import { useDisclosure, useToggle } from "@mantine/hooks";
import { QRCodeSVG } from "qrcode.react";

const useStyles = createStyles((theme) => ({
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontFamily: `Greycliff CF ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    lineHeight: 1.2,
    fontSize: rem(32),
    marginTop: theme.spacing.xs,
  },

  category: {
    color: theme.white,
    opacity: 0.7,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  progressLabel: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
    fontSize: theme.fontSizes.sm,
  },
  stat: {
    borderBottom: `${rem(3)} solid`,
    paddingBottom: rem(5),
  },

  statCount: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1.3,
  },

  diff: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },
}));

interface ArticleCardImageProps {
  image: string;
  title: string;
  price: string;
  address: string;
  dateTime: string;
  postId: string;
  sales: string;
  clicks: string;
  affiliateSales?: string;
  affiliateClicks?: string;
  postOrganizationId: string;
  affiliateStripeAccountId?: string;
  userId?: string;
  linkId?: string;
  organizationId: string;
  organizationStripeId: string;
  cancelUrl?: string;
}

export function ArticleCardImage({
  image,
  title,
  price,
  address,
  dateTime,
  postOrganizationId,
  organizationId,
  affiliateStripeAccountId,
  linkId,
  postId,
  sales,
  userId,
  clicks,
  affiliateSales = "0",
  affiliateClicks = "0",
  cancelUrl,
}: ArticleCardImageProps) {
  const { classes } = useStyles();
  const { dayOfWeek, day, month, year, time } = convertDateString(dateTime);
  const [buyClicked, toggleBuy] = useToggle([false, true]);
  const [shareClicked, toggleShare] = useToggle([false, true]);
  const [flipped, toggleFlip] = useToggle([false, true]);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Buy" centered>
        <QRCodeSVG
          value={`${baseUrl}/api/posts/${postId}/buy`}
          style={{
            margin: "auto",
          }}
        />
      </Modal>
      <ReactCardFlip
        isFlipped={flipped}
        flipDirection="horizontal"
        containerStyle={{ perspective: "1000px", display: "flex" }}
      >
        <Paper shadow="md" p="xl" radius="xl" className={classes.card}>
          <Stack>
            <Flex gap={rem(5)} justify="space-around">
              <Image src={image} alt={title} maw={300} radius="lg" />
              <Stack align="center" justify="center">
                <Title>{title}</Title>
                <Text mx="auto">{address}</Text>
                <Text>{`${dayOfWeek} ${month} ${day}, ${year}`}</Text>
                <Text>{time}</Text>
              </Stack>
            </Flex>
            <Title order={4}>{`Ticket: $${price}`}</Title>
            <Title order={3}>{`Est. Total (after fees): $${
              1.1 * parseFloat(price) + 1.0
            }`}</Title>
            {linkId && affiliateStripeAccountId ? (
              <Title mx="auto">
                Going with a group? Share this ticket and save!
              </Title>
            ) : (
              <Title mx="auto">Share a link, get paid today!</Title>
            )}
            <Form action={"/api/stripe/checkoutsessions"} method="post">
              <input type="hidden" name="postId" value={postId} />
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="cancelUrl" value={cancelUrl} />
              <input type="hidden" name="linkId" value={linkId} />
              <Button
                color="#7ed957"
                type="submit"
                miw="100%"
                style={{ background: "#7ed957" }}
                uppercase
                radius="xl"
                loading={buyClicked}
                onClick={() => toggleBuy()}
              >
                <Title order={3}>Buy</Title>
              </Button>
            </Form>
            <Button
              color="#1db05b"
              style={{ background: "#1db05b" }}
              uppercase
              radius="xl"
              loading={shareClicked}
              onClick={() => toggleShare()}
            >
              <Link prefetch="intent" to={`/links/create/${postId}`}>
                <Title order={3}>Repost / Share</Title>
              </Link>
            </Button>
            {postOrganizationId === organizationId && (
              <Group grow>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button variant="outline">
                      <IconSettings />
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Application</Menu.Label>
                    <Menu.Item
                      icon={<IconGraph size={14} />}
                      onClick={() => toggleFlip()}
                    >
                      Stats
                    </Menu.Item>
                    <Menu.Item icon={<IconShare size={14} />}>
                      <Link prefetch="intent" to={`/posts/links/${postId}`}>
                        Share
                      </Link>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => open()}
                      icon={<IconQrcode size={14} />}
                    >
                      Generate Buy QR code
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Button variant="outline" color="yellow">
                  <Link prefetch="intent" to={`/scan/${postId}`}>
                    <Title order={3}>Scan</Title>
                  </Link>
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>
        <Paper
          shadow="md"
          p="xl"
          radius="xl"
          styles={classes.card}
          w="531.5px"
          h="753.078px"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Group position="apart">
            <Text fz="xl" fw={700}>
              {`$${
                (parseInt(sales) + parseInt(affiliateSales)) * parseFloat(price)
              }`}
            </Text>
            <IconDeviceAnalytics
              size="1.4rem"
              className={classes.icon}
              stroke={1.5}
            />
          </Group>

          <Text c="dimmed" fz="sm">
            Total Revenue for this post
          </Text>

          <Title order={3} my={rem(6)}>
            Sales
          </Title>

          <Progress
            sections={[
              {
                value:
                  (parseFloat(sales) /
                    (parseInt(sales) + parseInt(affiliateSales))) *
                  100,
                color: "green.8",
                label:
                  (parseFloat(sales) /
                    (parseInt(sales) + parseInt(affiliateSales))) *
                    100 >
                  10
                    ? `${
                        (parseFloat(sales) /
                          (parseInt(sales) + parseInt(affiliateSales))) *
                        100
                      }%`
                    : undefined,
              },
              {
                value:
                  (parseFloat(affiliateSales) /
                    (parseInt(sales) + parseInt(affiliateSales))) *
                  100,
                color: "grape.8",
                label:
                  (parseFloat(affiliateSales) /
                    (parseInt(sales) + parseInt(affiliateSales))) *
                    100 >
                  10
                    ? `${
                        (parseFloat(affiliateSales) /
                          (parseInt(sales) + parseInt(affiliateSales))) *
                        100
                      }%`
                    : undefined,
              },
            ]}
            size={34}
            classNames={{ label: classes.progressLabel }}
          />
          <SimpleGrid
            cols={2}
            breakpoints={[{ maxWidth: "xs", cols: 1 }]}
            mt="xl"
          >
            {[
              <Box
                key={"Sales"}
                sx={{ borderBottomColor: "green.8" }}
                className={classes.stat}
              >
                <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
                  {"Sales"}
                </Text>

                <Group position="apart" align="flex-end" spacing={0}>
                  <Text fw={700}>{sales}</Text>
                  <Text
                    c={"green.8"}
                    fw={700}
                    size="sm"
                    className={classes.statCount}
                  >
                    {(parseFloat(sales) /
                      (parseInt(sales) + parseInt(affiliateSales))) *
                      100}
                    %
                  </Text>
                </Group>
              </Box>,
              <Box
                key={"Affiliate Sales"}
                sx={{ borderBottomColor: "grape.8" }}
                className={classes.stat}
              >
                <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
                  {"Affiliate Sales"}
                </Text>

                <Group position="apart" align="flex-end" spacing={0}>
                  <Text fw={700}>{affiliateSales}</Text>
                  <Text
                    c={"grape.8"}
                    fw={700}
                    size="sm"
                    className={classes.statCount}
                  >
                    {(parseFloat(affiliateSales) /
                      (parseInt(sales) + parseInt(affiliateSales))) *
                      100}
                    %
                  </Text>
                </Group>
              </Box>,
            ]}
          </SimpleGrid>

          <Title order={3} mb={rem(6)} mt={rem(15)}>
            Clicks
          </Title>

          <Progress
            sections={[
              {
                value:
                  (parseFloat(clicks) /
                    (parseInt(clicks) + parseInt(affiliateClicks))) *
                  100,
                color: "green.8",
                label:
                  (parseFloat(clicks) /
                    (parseInt(clicks) + parseInt(affiliateClicks))) *
                    100 >
                  10
                    ? `${
                        (parseFloat(clicks) /
                          (parseInt(clicks) + parseInt(affiliateClicks))) *
                        100
                      }%`
                    : undefined,
              },
              {
                value:
                  (parseFloat(affiliateClicks) /
                    (parseInt(clicks) + parseInt(affiliateClicks))) *
                  100,
                color: "grape.8",
                label:
                  (parseFloat(affiliateClicks) /
                    (parseInt(clicks) + parseInt(affiliateClicks))) *
                    100 >
                  10
                    ? `${
                        (parseFloat(affiliateClicks) /
                          (parseInt(clicks) + parseInt(affiliateClicks))) *
                        100
                      }%`
                    : undefined,
              },
            ]}
            size={34}
            classNames={{ label: classes.progressLabel }}
          />
          <SimpleGrid
            cols={2}
            breakpoints={[{ maxWidth: "xs", cols: 1 }]}
            mt="xl"
          >
            {[
              <Box
                key={"Clicks"}
                sx={{ borderBottomColor: "green.8" }}
                className={classes.stat}
              >
                <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
                  {"Clicks"}
                </Text>

                <Group position="apart" align="flex-end" spacing={0}>
                  <Text fw={700}>{clicks}</Text>
                  <Text
                    c={"green.8"}
                    fw={700}
                    size="sm"
                    className={classes.statCount}
                  >
                    {(parseFloat(clicks) /
                      (parseInt(clicks) + parseInt(affiliateClicks))) *
                      100}
                    %
                  </Text>
                </Group>
              </Box>,
              <Box
                key={"Affiliate Clicks"}
                sx={{ borderBottomColor: "grape.8" }}
                className={classes.stat}
              >
                <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
                  {"Affiliate Clicks"}
                </Text>

                <Group position="apart" align="flex-end" spacing={0}>
                  <Text fw={700}>{affiliateClicks}</Text>
                  <Text
                    c={"grape.8"}
                    fw={700}
                    size="sm"
                    className={classes.statCount}
                  >
                    {(parseFloat(affiliateClicks) /
                      (parseInt(clicks) + parseInt(affiliateClicks))) *
                      100}
                    %
                  </Text>
                </Group>
              </Box>,
            ]}
          </SimpleGrid>
        </Paper>
      </ReactCardFlip>
    </>
  );
}
