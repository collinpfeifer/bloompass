import { useEffect } from "react";
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
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";
import { isValidPhoneNumber, AsYouType } from "libphonenumber-js/mobile";
import { PasswordStrength } from "~/components/passwordstrength";
import { loginUser, signUpUser } from "~/models/user.server";
import { useForm } from "@mantine/form";

export const loader = async ({ request }: LoaderArgs) => {
  let params = new URLSearchParams(request.url.split("?")[1]);
  const redirectTo = params.get("redirectTo");
  const userId = await getUserId(request);
  if (userId) return redirect(`/user/stripe/authorize?${redirectTo}`);
  else return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const phoneNumber = formData.get("phoneNumber");
  const password = formData.get("password");
  const name = formData.get("name");
  const redirectTo = safeRedirect(
    `/user/stripe/authorize?${formData.get("redirectTo")}`
  );

  if (
    typeof phoneNumber !== "string" ||
    !isValidPhoneNumber(phoneNumber) ||
    phoneNumber.length === 0 ||
    phoneNumber.length < 10 ||
    phoneNumber.length > 15 ||
    phoneNumber[0] !== "+"
  ) {
    return json(
      {
        toggle: null,
        errors: {
          name: null,
          phoneNumber: "Phone Number is invalid",
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
          phoneNumber: null,
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
          phoneNumber: null,
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
          phoneNumber: null,
          password: null,
          name: "Name is required",
        },
      },
      { status: 400 }
    );
  }

  if (name) {
    const user = await signUpUser({ phoneNumber, password, name });
    console.log(user);
    return await createUserSession({
      redirectTo,
      remember: true,
      refreshToken: user.refreshToken,
      request,
      accessToken: user.accessToken,
    });
  } else {
    const user = await loginUser({ phoneNumber, password });
    if (user?.statusCode === 400 && user?.message === "User does not exist") {
      return json(
        {
          toggle: "sign up",
          errors: {
            name: null,
            phoneNumber: null,
            password: null,
            terms: null,
          },
        },
        { status: 400 }
      );
    }
    return await createUserSession({
      redirectTo,
      remember: true,
      refreshToken: user.refreshToken,
      request,
      accessToken: user.accessToken,
    });
  }
};

export const meta: V2_MetaFunction = () => [{ title: "User Join" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [type, toggle] = useToggle(["login", "sign up"]);
  const data = useActionData<typeof action>();
  const [visible, handlers] = useDisclosure(false);
  const formatter = new AsYouType();

  const form = useForm({
    initialValues: {
      name: "",
      phoneNumber: "+1",
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

        <Form method="POST" action="/user/join" replace>
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
                required
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                placeholder="+1"
                withAsterisk
                size="xl"
                error={data?.errors?.phoneNumber || form.errors.phoneNumber}
                {...form.getInputProps("phoneNumber")}
                onChange={(event) =>
                  form.setFieldValue(
                    "phoneNumber",
                    formatter.input(event.currentTarget.value)
                  )
                }
                radius="md"
              />
            </MediaQuery>
            <MediaQuery smallerThan="md" styles={{ display: "none" }}>
              <TextInput
                required
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                placeholder="+1"
                withAsterisk
                size="md"
                error={data?.errors?.phoneNumber || form.errors.phoneNumber}
                {...form.getInputProps("phoneNumber")}
                onChange={(event) =>
                  form.setFieldValue(
                    "phoneNumber",
                    formatter.input(event.currentTarget.value)
                  )
                }
                radius="md"
              />
            </MediaQuery>
            {type === "login" && (
              <>
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
              </>
            )}
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            {type === "sign up" && (
              <PasswordStrength
                error={data?.errors?.password || form.errors.password}
                {...form.getInputProps("password")}
              />
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
                ? "Already have a user account? Login"
                : "Don't have a user account? Sign up"}
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
