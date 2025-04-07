import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Flex,
  Image,
  Paper,
  Stack,
  Text,
  Group,
  Title,
  Button,
} from "@mantine/core";
import AddtoWallet from "../assets/US-UK_Add_to_Apple_Wallet_RGB_101421.svg";
import { QRCodeSVG } from "qrcode.react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { convertDateString } from "~/utils";
import invariant from "tiny-invariant";
import { getPass } from "~/models/pass.server";
import Bloomlogo from "../assets/Bloompass_logo.png";
import { useToggle } from "@mantine/hooks";

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.passId, "postId not found");
  const pass = await getPass(params.passId);
  return json({
    pass,
    passApi: process.env.PASS_API_GATEWAY,
  });
};

export default function Pass() {
  const { pass, passApi } = useLoaderData<typeof loader>();
  const date = convertDateString(pass.date_time);
  const [shareClicked, toggleShare] = useToggle([false, true]);
  return (
    <>
      <Paper shadow="md" radius="lg" p="lg" bg="black">
        <Flex justify="space-between" wrap="nowrap">
          <Image src={Bloomlogo} alt="" maw="10rem" />
          <Flex wrap='nowrap'>
            Scanned:
            {pass.scanned ? <IconCheck color="green" /> : <IconX color="red" />}
          </Flex>
        </Flex>
        <Stack m={5} align="center">
          <Title order={3}>{pass.title}</Title>
          <Group>
            <Title>{`$${pass.price}`}</Title>
            <Flex m="auto" justify="space-between" direction="column">
              <Text>{`${date.dayOfWeek} ${date.month} ${date.day}, ${date.year}`}</Text>
              <Text>{date.time}</Text>
              <Text>{pass.address}</Text>
            </Flex>
          </Group>
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "25%",
            }}
          >
            <QRCodeSVG
              value={pass.barcode}
              style={{
                margin: "auto",
              }}
            />
          </div>
          <Title order={4}>Make money from this event...</Title>
          <Button
            color="#1db05b"
            style={{ background: "#1db05b" }}
            uppercase
            radius="xl"
            loading={shareClicked}
            onClick={() => toggleShare()}
          >
            <Link to={`/links/create?postId=${pass.postId}`}>
              <Title order={3}>Repost / Share</Title>
            </Link>
          </Button>
        </Stack>
      </Paper>
      <a
        style={{ margin: "0 5rem", minWidth: "10rem" }}
        href={`${passApi}/pkpasses/${pass.id}`}
        download={`${pass.title}.pkpass`}
      >
        <Image src={AddtoWallet} alt="" />
      </a>
    </>
  );
}
