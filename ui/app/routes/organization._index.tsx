import {
  Avatar,
  Card,
  Text,
  Divider,
  createStyles,
  rem,
  ThemeIcon,
  Group,
  Button,
  Menu,
  MediaQuery,
  Stack,
} from "@mantine/core";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, Link } from "@remix-run/react";
import {
  IconEdit,
  IconLogout,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { getOrganization } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const organization = await getOrganization(request);

  if (!organization) return redirect("/organization/join");
  if (!organization.onboardingComplete)
    return redirect("/organization/stripe/authorize");
  return json({ organization });
};

export const meta: V2_MetaFunction = () => [{ title: "Organization" }];

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 150ms ease, box-shadow 100ms ease",
    padding: theme.spacing.xl,
    paddingLeft: `calc(${theme.spacing.xl} * 2)`,

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
    },

    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: rem(6),
      backgroundImage: theme.fn.linearGradient(
        0,
        theme.colors.pink[6],
        theme.colors.orange[6]
      ),
    },
  },

  avatar: {
    border: `${rem(2)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
    }`,
  },
}));

export default function Organization() {
  const { classes } = useStyles();
  const { organization } = useLoaderData<typeof loader>();
  return (
    <Card withBorder padding="xl" radius="md" className={classes.card}>
      <Stack>
        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Menu shadow="md" width={300}>
            <Menu.Target>
              <ThemeIcon
                size="xl"
                radius="md"
                variant="gradient"
                gradient={{ deg: 0, from: "pink", to: "orange" }}
              >
                <IconSettings size={rem(28)} stroke={1.5} />
              </ThemeIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
              <Form action="/organization/logout" method="post">
                <Menu.Item icon={<IconLogout size={14} />} type="submit">
                  Logout
                </Menu.Item>
              </Form>
              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item color="blue" icon={<IconEdit size={14} />}>
                Edit my account
              </Menu.Item>
              <Menu.Item color="red" icon={<IconTrash size={14} />}>
                Delete my account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </MediaQuery>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Menu shadow="md" width={400}>
            <Menu.Target>
              <ThemeIcon
                size="4rem"
                radius="md"
                variant="gradient"
                gradient={{ deg: 0, from: "pink", to: "orange" }}
              >
                <IconSettings size={rem(45)} stroke={1.5} />
              </ThemeIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                <Text fz="2rem">Application</Text>
              </Menu.Label>
              <Menu.Item icon={<IconSettings size={35} />}>
                <Text fz="2.5rem">Settings</Text>
              </Menu.Item>
              <Form action="/organization/logout" method="post">
                <Menu.Item icon={<IconLogout size={35} />} type="submit">
                  <Text fz="2.5rem">Logout</Text>
                </Menu.Item>
              </Form>
              <Menu.Label>
                <Text fz="2rem">Danger zone</Text>
              </Menu.Label>
              <Menu.Item color="blue" icon={<IconEdit size={35} />}>
                <Text fz="2.5rem">Edit my account</Text>
              </Menu.Item>
              <Menu.Item color="red" icon={<IconTrash size={35} />}>
                <Text fz="2.5rem">Delete my account</Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </MediaQuery>
        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Avatar
            src={organization.image}
            size={200}
            radius={200}
            className={classes.avatar}
            m="auto"
          >
            {organization.name
              .split(/\s/)
              .reduce(
                (response: any, word: string | any[]) =>
                  (response += word.slice(0, 1)),
                ""
              )}
          </Avatar>
        </MediaQuery>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Avatar
            src={organization.image}
            size={500}
            radius={500}
            className={classes.avatar}
            m="auto"
          >
            {organization.name
              .split(/\s/)
              .reduce(
                (response: any, word: string | any[]) =>
                  (response += word.slice(0, 1)),
                ""
              )}
          </Avatar>
        </MediaQuery>
        <Text ta="center" className="med:text-xl text-4xl" fw={500} mt="sm">
          {organization.name}
        </Text>
        <Text ta="center" className="med:text-lg text-2xl" c="dimmed">
          {organization.email}
        </Text>
        <Divider mt="xl" />
        <Group m={rem(2)} position="center">
          <Button
            className="my-5"
            color="teal"
            size="xl"
            uppercase
            variant="outline"
          >
            <Link prefetch="intent" to="/posts/create">
              <Text className="med:text-lg lg:text-med text-xl">
                Make a post
              </Text>
            </Link>
          </Button>
          <Button
            className="my-5"
            color="orange"
            size="xl"
            uppercase
            variant="outline"
          >
            <Link prefetch="intent" to="/posts">
              <Text className="med:text-lg lg:text-med text-xl">Posts</Text>
            </Link>
          </Button>
          <Form action="/organization/stripe/dashboard" method="post">
            <Button
              className="my-5"
              size="xl"
              uppercase
              variant="outline"
              type="submit"
            >
              <Text className="med:text-lg lg:text-med text-xl">Dashboard</Text>
            </Button>
          </Form>
        </Group>
      </Stack>
    </Card>
  );
}
