import { useState, useEffect } from "react";
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  MediaQuery,
  LoadingOverlay,
} from "@mantine/core";
import { useToggle, upperFirst, useDisclosure } from "@mantine/hooks";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { createOrganizationSession, getOrganizationId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { PasswordStrength } from "~/components/passwordstrength";
import {
  loginOrganization,
  signUpOrganization,
} from "~/models/organization.server";
import { useForm } from "@mantine/form";

export const loader = async ({ request }: LoaderArgs) => {
  let params = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = params.get("redirectTo");
  const organizationId = await getOrganizationId(request);
  if (organizationId)
    return redirect(`organization/stripe/authorize?${redirectTo}`);
  else return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const redirectTo = safeRedirect(
    `/organization/stripe/authorize?${formData.get("redirectTo")}`
  );

  if (typeof email !== "string" || !validateEmail(email)) {
    return json(
      {
        toggle: null,
        errors: {
          name: null,
          email: "Email is invalid",
          password: null,
          terms: null,
        },
      },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      {
        toggle: null,
        errors: {
          name: null,
          email: null,
          password: "Password is required",
        },
      },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      {
        toggle: null,
        errors: {
          name: null,
          email: null,
          password: "Password is too short",
        },
      },
      { status: 400 }
    );
  }

  if (name && typeof name !== "string") {
    return json(
      {
        toggle: null,
        errors: {
          email: null,
          password: null,
          name: "Name is required",
        },
      },
      { status: 400 }
    );
  }

  if (name) {
    const organization = await signUpOrganization({
      email,
      password,
      name,
    });
    return await createOrganizationSession({
      redirectTo,
      remember: true,
      refreshToken: organization.refreshToken,
      request,
      accessToken: organization.accessToken,
    });
  } else {
    const organization = await loginOrganization({ email, password });
    if (
      organization?.statusCode === 400 &&
      organization?.message === "Organization does not exist"
    ) {
      return json(
        {
          toggle: "sign up",
          errors: {
            name: null,
            email: null,
            password: null,
            terms: null,
          },
        },
        { status: 400 }
      );
    }
    return await createOrganizationSession({
      redirectTo,
      remember: true,
      refreshToken: organization.refreshToken,
      request,
      accessToken: organization.accessToken,
    });
  }
};

export const meta: V2_MetaFunction = () => [{ title: "Organization Join" }];

export default function OrganizationJoin() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [type, toggle] = useToggle(["login", "sign up"]);
  const [strengthPassword, setStrengthPassword] = useState("");
  const [visible, handlers] = useDisclosure(false);
  const data = useActionData<typeof action>();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: (values) => {
      return {};
    },
  });

  useEffect(() => {
    if (data && data?.toggle) {
      toggle(data?.toggle);
    }
    if (data?.errors) {
      handlers.toggle();
    }
  }, [data]);

  return (
    <Paper radius="md" p="xl" withBorder pos="relative">
      <LoadingOverlay visible={visible} overlayBlur={2} />
      <Stack>
        <Text className="md:text2-xl text-4xl lg:text-xl" weight={500}>
          Welcome to Bloompass, {type} with
        </Text>
        <Form method="POST" action="/organization/join" replace>
          <Stack>
            {type === "sign up" && (
              <MediaQuery largerThan="md" styles={{ display: "none" }}>
                <TextInput
                  label="Name"
                  name="name"
                  size="xl"
                  withAsterisk
                  error={data?.errors?.name || form.errors.name}
                  placeholder="Your name"
                  radius="md"
                  {...form.getInputProps("name")}
                />
              </MediaQuery>
            )}
            {type === "sign up" && (
              <MediaQuery smallerThan="md" styles={{ display: "none" }}>
                <TextInput
                  label="Name"
                  name="name"
                  size="md"
                  withAsterisk
                  error={data?.errors?.name || form.errors.name}
                  placeholder="Your name"
                  radius="md"
                  {...form.getInputProps("name")}
                />
              </MediaQuery>
            )}
            <MediaQuery largerThan="md" styles={{ display: "none" }}>
              <TextInput
                label="Email"
                type="email"
                name="email"
                placeholder="Your email"
                withAsterisk
                size="xl"
                error={data?.errors?.email || form.errors.email}
                radius="md"
                {...form.getInputProps("email")}
              />
            </MediaQuery>
            <MediaQuery smallerThan="md" styles={{ display: "none" }}>
              <TextInput
                label="Email"
                type="email"
                name="email"
                placeholder="Your email"
                withAsterisk
                size="md"
                error={data?.errors?.email || form.errors.email}
                radius="md"
                {...form.getInputProps("email")}
              />
            </MediaQuery>
            {type === "login" && (
              <MediaQuery largerThan="md" styles={{ display: "none" }}>
                <PasswordInput
                  withAsterisk
                  label="Password"
                  name="password"
                  size="xl"
                  error={data?.errors?.password || form.errors.password}
                  placeholder="Your password"
                  radius="md"
                  {...form.getInputProps("password")}
                />
              </MediaQuery>
            )}
            {type === "login" && (
              <MediaQuery smallerThan="md" styles={{ display: "none" }}>
                <PasswordInput
                  withAsterisk
                  label="Password"
                  name="password"
                  size="md"
                  error={data?.errors?.password || form.errors.password}
                  placeholder="Your password"
                  radius="md"
                  {...form.getInputProps("password")}
                />
              </MediaQuery>
            )}
            {type === "sign up" && (
              <PasswordStrength
                {...form.getInputProps("password")}
                value={strengthPassword}
                onChange={(event) => {
                  setStrengthPassword(event.currentTarget.value);
                }}
                error={data?.errors?.password}
              />
            )}
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}
            {type === "sign up" && (
              <MediaQuery largerThan="md" styles={{ display: "none" }}>
                <Checkbox
                  label="I accept terms and conditions"
                  size="xl"
                  name="terms"
                />
              </MediaQuery>
            )}
            {type === "sign up" && (
              <MediaQuery smallerThan="md" styles={{ display: "none" }}>
                <Checkbox
                  label="I accept terms and conditions"
                  size="md"
                  name="terms"
                />
              </MediaQuery>
            )}
          </Stack>
          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              color="dimmed"
              onClick={() => toggle()}
              className="md:text-md text-xl lg:text-sm"
            >
              {type === "sign up"
                ? "Already have an organization account? Login"
                : "Don't have an organization account? Sign up"}
            </Anchor>
            <Button
              type="submit"
              radius="xl"
              onClick={() => handlers.toggle()}
              style={{ background: "green" }}
            >
              <Text className="text-xl md:text-xl lg:text-lg">
                {upperFirst(type)}
              </Text>
            </Button>
          </Group>
        </Form>
      </Stack>
    </Paper>
  );
}
