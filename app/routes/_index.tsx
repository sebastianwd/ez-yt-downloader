import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { env } from "~/utils/constants";
import { ytGetId } from "~/utils/get-yt-id";
import { IndexPage } from "~/pages";
import { cache } from "~/utils/cache";

type ActionData = {
  url: string;
  downloadType: "video" | "audio";
};

export const meta: MetaFunction = () => {
  return [
    { title: "EZ YT Downloader" },
    {
      name: "description",
      content: "Download YouTube videos quick, easy and free.",
    },
  ];
};

const getCompleteProviderUrl = (url: string, id: string) => {
  const providerUrl = new URL(`${url}/latest_version`);

  providerUrl.searchParams.append("id", id);
  providerUrl.searchParams.append("itag", "18");
  return providerUrl.toString();
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const json = (await Object.fromEntries(formData)) as ActionData;

  const cachedResult = cache.get(json.url);

  if (cachedResult) {
    console.log("Using cached result for:", json.url);
    return cachedResult;
  }

  if (env.YT_PROVIDER_URLS.length === 0) {
    throw new Error("No YT_PROVIDER_URLS provided");
  }

  const ytId = ytGetId(json.url)?.id;

  if (!ytId) {
    throw new Error("No video ID found in URL");
  }

  const formattedUrls = env.YT_PROVIDER_URLS.map((url) =>
    Buffer.from(getCompleteProviderUrl(url, ytId)).toString("base64")
  );

  return formattedUrls;
}

export default function Index() {
  return <IndexPage />;
}
