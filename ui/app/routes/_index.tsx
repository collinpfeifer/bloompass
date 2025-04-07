import {
  createStyles,
  Overlay,
  Container,
  Title,
  Button,
  rem,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { HeaderSimple } from "../components/header";

const useStyles = createStyles((theme) => ({
  hero: {
    position: "relative",
    backgroundImage:
      "url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1544&q=80)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100%",
    minWidth: "100%",
  },

  container: {
    minHeight: `calc(100dvh - ${theme.spacing.xl} - 64.3px)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingBottom: `calc(${theme.spacing.xl} * 6)`,
    zIndex: 1,
    position: "relative",

    [theme.fn.smallerThan("sm")]: {
      height: rem(500),
      paddingBottom: `calc(${theme.spacing.xl} * 3)`,
    },
  },

  title: {
    color: theme.white,
    fontSize: rem(70),
    fontWeight: 900,
    lineHeight: 1.1,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(40),
      lineHeight: 1.2,
    },

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      lineHeight: 1.3,
    },
  },

  description: {
    color: theme.white,
    maxWidth: 600,

    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100%",
      fontSize: theme.fontSizes.sm,
    },
  },

  control: {
    marginTop: `calc(${theme.spacing.xl} * 1.5)`,

    [theme.fn.smallerThan("sm")]: {
      width: "100%",
    },
  },
}));

export default function Index() {
  const { classes } = useStyles();
  const [ctaButtonClicked, toggle] = useToggle([false, true]);

  return (
    <div className={classes.hero}>
      <HeaderSimple />
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, .65) 40%)"
        opacity={1}
        zIndex={0}
      />
      <Container className={classes.container}>
        <Title order={1} className={classes.title}>
          Grow your events with organic marketing
        </Title>
        <Title order={2} className={classes.description} mt="xl">
          We use social media to grow your events exponetially.
        </Title>
        <Title order={2} className={classes.description} mt="xl">
          With our affiliate marketing, users promote your events and earn a
          commission on each ticket sold, at no cost to you.
        </Title>
        <Button
          variant="outline"
          style={{ backgroundColor: "black" }}
          size="xl"
          radius="xl"
          color="violet"
          className={classes.control}
          loading={ctaButtonClicked}
          onClick={() => toggle()}
        >
          <Link prefetch="intent" to="organization/join">
            Free to use. Forever.
          </Link>
        </Button>
      </Container>
    </div>
  );
}
