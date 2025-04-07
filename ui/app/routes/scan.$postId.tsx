import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { notifications } from "@mantine/notifications";
import { QrReader } from "react-qr-reader";
import { getOrganizationId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

export const loader = async ({ params, request }: LoaderArgs) => {
  const organizationId = await getOrganizationId(request);
  invariant(params.postId, "postId is required");
  if (!organizationId) {
    return redirect(`/organization/join?redirectTo=/scan/${params.postId}`);
  }
  return json({ postId: params.postId });
};

export default function ScanPostPass() {
  const { postId } = useLoaderData<typeof loader>();
  const handleScan = async (result: any, error: any) => {
    if (error) return console.log(error);
    notifications.show({
      id: "scanning",
      title: "Scanning...",
      message: "Please wait a moment",
      withCloseButton: true,
    });
    const formData = new FormData();
    formData.append("data", result.text);
    formData.append("postId", postId);
    const response = await fetch(`/api/scan`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
    notifications.show({
      id: "response",
      title: response.detail,
      message: response.detail,
      withCloseButton: true,
      autoClose: 5000,
    });
  };
  return (
    <QrReader
      scanDelay={2000}
      onResult={handleScan}
      containerStyle={{ width: "400px" }}
      constraints={{ facingMode: "environment" }}
    />
  );
}
