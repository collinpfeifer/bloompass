import { forwardRef, useEffect } from "react";
import {
  Button,
  TextInput,
  Text,
  Center,
  rem,
  Paper,
  Image,
  Autocomplete,
  Loader,
  NumberInput,
  NativeSelect,
  Grid,
  FileInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import type {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getOrganizationId } from "~/session.server";
import { Form, useFetcher } from "@remix-run/react";
import { useToggle } from "@mantine/hooks";
import { createPost } from "~/models/post.server";

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const organizationId = await getOrganizationId(request);
  if (!organizationId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const dateTime = formData.get("dateTime");
  const address = formData.get("address");
  const price = formData.get("price");

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const dateTimeString =
    dateTime && typeof dateTime === "string"
      ? new Date(Date.parse(dateTime)).toISOString()
      : "";

  const post = await createPost({
    request,
    title: title as string,
    date_time: dateTimeString,
    address: address as string,
    price: price as string,
    image: formData,
  });

  return redirect(`/posts/links/${post.id}`);
};

export const meta: V2_MetaFunction = () => [{ title: "Create a Post" }];

export default function CreatePost() {
  const [loading, toggle] = useToggle([false, true]);
  const fetcher = useFetcher();
  const regex = new RegExp(
    "[0-9]{1,5}( [a-zA-Z.]*){1,4},?( [a-zA-Z]*){1,3},? [a-zA-Z]{2},? [0-9]{5}",
    "g"
  );

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: {
      image: null,
      title: "",
      dateTime: new Date(),
      address: "",
      price: 10,
    },

    validate: {
      image: (value) =>
        value === null ? "Advertisement image is required" : null,
      title: (value) =>
        value.trim().length < 3
          ? "Title must include at least 3 characters"
          : null,
      dateTime: (value) =>
        value === null
          ? "Date and time is required"
          : null || value.getTime() < Date.now()
          ? "Date and time must be in the future"
          : null,
      address: (value) =>
        (value.trim().length < 3 ? "Address is required" : null) ||
        regex.test(value.trim())
          ? "Address must be valid"
          : null,
      price: (value) => (value < 5 ? "Price must be at least $5" : null),
    },
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (
      form.values.address.length > 3 &&
      fetcher.state !== "loading" &&
      fetcher.state !== "submitting"
    ) {
      timeout = setTimeout(async () => {
        fetcher.load(`/api/autocomplete?address=${form.values.address}`);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [form.values.address]);

  interface ItemProps {
    full_address: string;
    address_line_1: string;
  }

  const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ full_address, address_line_1, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
        <Text>{full_address}</Text>
      </div>
    )
  );
  const currencies = [
    // { value: "eur", label: "🇪🇺 EUR" },
    { value: "usd", label: "🇺🇸 USD" },
    // { value: "cad", label: "🇨🇦 CAD" },
    // { value: "gbp", label: "🇬🇧 GBP" },
    // { value: "aud", label: "🇦🇺 AUD" },
  ];

  const select = (
    <NativeSelect
      data={currencies}
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          width: rem(92),
        },
      }}
    />
  );

  return (
    <Center h="100%">
      <Paper p={rem(15)} radius={25}>
        <Form
          method="post"
          action="/posts/create"
          reloadDocument
          encType="multipart/form-data"
        >
          <Grid grow my={rem(5)}>
            <Grid.Col span={12} md={6}>
              <TextInput
                label="Title"
                name="title"
                withAsterisk
                placeholder="Your title"
                {...form.getInputProps("title")}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <DateTimePicker
                label="Date and Time"
                name="dateTime"
                valueFormat="DD MMM YYYY hh:mm A"
                variant="filled"
                withAsterisk
                placeholder="Pick date and time"
                mx="auto"
                {...form.getInputProps("dateTime")}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <Autocomplete
                label="Address"
                withAsterisk
                name="address"
                placeholder="Your address"
                rightSection={
                  fetcher.state === "loading" ||
                  fetcher.state === "submitting" ? (
                    <Loader size="1rem" />
                  ) : null
                }
                itemComponent={AutoCompleteItem}
                data={fetcher.data || []}
                {...form.getInputProps("address")}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <NumberInput
                label="Price"
                withAsterisk
                name="price"
                placeholder="Price"
                rightSection={select}
                rightSectionWidth={80}
                {...form.getInputProps("price")}
              />
            </Grid.Col>
            <Grid.Col span={12} md={6}>
              <FileInput
                name="image"
                label="Advertisement Image"
                withAsterisk
                placeholder="Your image"
                icon={<IconUpload />}
                accept="image/png,image/jpeg"
                {...form.getInputProps("image")}
              />
              {form.values.image && (
                <Image
                  h="auto"
                  mx="auto"
                  maw={500}
                  src={URL.createObjectURL(form.values.image)}
                  alt="Advertisement"
                />
              )}
            </Grid.Col>
          </Grid>
          <Button
            variant="outline"
            type="submit"
            loading={loading}
            onClick={() => toggle()}
          >
            Submit
          </Button>
        </Form>
      </Paper>
    </Center>
  );
}
