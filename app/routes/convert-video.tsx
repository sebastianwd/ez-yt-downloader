import type { HeadersFunction } from "@remix-run/node";
import { ConvertVideoPage } from "~/pages/convert-video";

export const headers: HeadersFunction = () => {
  return {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
};

export default function ConvertVideo() {
  return <ConvertVideoPage />;
}
