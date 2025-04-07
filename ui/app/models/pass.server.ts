const fetch = require("fetch-retry")(global.fetch);

export const getPass = async (id: string) => {
  const response = await fetch(`${process.env.PASS_API_GATEWAY}/passes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const getPasses = async () => {
  const response = await fetch(`${process.env.PASS_API_GATEWAY}/passes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};

export const scanPass = async ({
  data,
  postId,
}: {
  data: FormDataEntryValue | null;
  postId: FormDataEntryValue | null;
}) => {
  const response = await fetch(
    `${process.env.PASS_API_GATEWAY}/scan/${postId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
      }),
    }
  )
    .then((res: Response) => res.json())
    .catch((err: Error) => console.log(err));
  return response;
};
