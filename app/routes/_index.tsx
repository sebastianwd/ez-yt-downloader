import type {
  ActionFunctionArgs,
  HeadersFunction,
  MetaFunction,
} from "@remix-run/node";
import ky from "ky";
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
  return providerUrl.toString();
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const json = (await Object.fromEntries(formData)) as ActionData;

  let mediaUrl: string | null = null;

  const cachedResult = cache.get(json.url);

  if (cachedResult) {
    console.log("Using cached result for:", json.url);
    return cachedResult;
  }

  if (env.YT_PROVIDER_URLS.length === 0) {
    throw new Error("No YT_PROVIDER_URLS provided");
  }

  console.log("urls: ", env.YT_PROVIDER_URLS);

  for (const baseProviderUrl of env.YT_PROVIDER_URLS) {
    console.log("try: ", baseProviderUrl);

    const ytId = ytGetId(json.url)?.id;
    if (!ytId) continue;

    if (cache.has(`error:${baseProviderUrl}`)) {
      console.log("Skipping provider:", baseProviderUrl);
      continue;
    }

    const providerUrl = getCompleteProviderUrl(baseProviderUrl, ytId);

    try {
      const response = await ky.head(providerUrl, {
        timeout: 10000,
        throwHttpErrors: false,
      });

      if (response.headers.get("content-type")?.includes("video")) {
        const redirectResponse = await ky.get(providerUrl);

        mediaUrl = redirectResponse.url;

        console.log("Redirect response: ", redirectResponse.url);

        cache.set(json.url, mediaUrl);

        break;
      }

      cache.set(`error:${providerUrl}`, "true");
    } catch (e) {
      console.error("Error fetching mediaUrl for: ", providerUrl, e);

      continue;
    }
  }

  return mediaUrl;
}

export const headers: HeadersFunction = () => {
  return {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
};

export default function Index() {
  return <IndexPage />;
}
