import {
  createStyles,
  Text,
  Container,
  Group,
  Image,
  rem,
  Button,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { useToggle } from "@mantine/hooks";
import png from "../assets/Bloompass_logo.png";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    marginTop: theme.spacing.xl,
  },
}));

export function HeaderSimple() {
  const { classes } = useStyles();
  const [userButtonClicked, userToggle] = useToggle([false, true]);
  const [organizationButtonClicked, organizationToggle] = useToggle([
    false,
    true,
  ]);

  return (
    <Container className={classes.header}>
      <Image src={png} maw={rem(200)} />
      <Group>
        <Button
          radius="xl"
          size="lg"
          style={{
            background: "linear-gradient(270deg, teal, purple)",
          }}
          loading={userButtonClicked}
          onClick={() => userToggle()}
        >
          <Link prefetch="intent" to="user/join">
            <Text size="xl">Users</Text>
          </Link>
        </Button>
        <Button
          radius="xl"
          size="lg"
          style={{
            background: "linear-gradient(90deg, teal, green)",
          }}
          loading={organizationButtonClicked}
          onClick={() => organizationToggle()}
        >
          <Link prefetch="intent" to="organization/join">
            <Text size="xl">Organizations</Text>
          </Link>
        </Button>
      </Group>
    </Container>
  );
}
