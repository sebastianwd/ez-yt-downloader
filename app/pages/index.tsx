/* eslint-disable jsx-a11y/media-has-caption */
import { Link, useFetcher } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Arrow8 } from "~/components/arrow";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export const IndexPage = () => {
  const fetcher = useFetcher<string[]>();

  const actionData = fetcher.data;

  const [videoChoice, setVideoChoice] = useState(0);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setVideoChoice(0);
    }
  }, [fetcher.state]);

  return (
    <div className="flex flex-col min-h-svh container mx-auto">
      <main className="grow p-4 flex items-center justify-evenly flex-wrap lg:flex-nowrap gap-4">
        <div className="grow lg:border-r border-gray-700 border-dashed">
          <section className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
              EZ YT Downloader
            </h1>
            <p className="text-xl">
              Fast and direct video downloads from YouTube.
            </p>
          </section>
          <div className="w-full max-w-md mx-auto">
            <fetcher.Form method="post" className="mb-8">
              <fieldset
                disabled={fetcher.state === "submitting"}
                className="space-y-4"
              >
                <Input
                  type="url"
                  placeholder="Paste video URL here"
                  required
                  className="w-full"
                  name="url"
                />
                <Button
                  disabled={fetcher.state === "submitting"}
                  type="submit"
                  variant="gradient"
                  className="w-full"
                >
                  {fetcher.state === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get video source"
                  )}
                </Button>
              </fieldset>
            </fetcher.Form>
            {actionData && (
              <>
                <div className="relative">
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    stopOnUnmount={false}
                    controls
                    url={atob(actionData[videoChoice])}
                    onError={(error) => {
                      console.log(error);
                      if (error) {
                        if (videoChoice < actionData.length - 1) {
                          setVideoChoice((prev) => prev + 1);
                        }
                      }
                    }}
                    className="w-full aspect-video"
                  />
                  <div className="absolute -bottom-10 right-5 flex flex-col items-center pointer-events-none">
                    <Arrow8 className="size-20 -rotate-12" />
                  </div>
                </div>
                <p className="mt-10 italic">
                  Click on the video options and select &quot;Download&quot; OR
                  <br /> right click on the video and select &quot;Save Video
                  As&quot;
                </p>
              </>
            )}
          </div>
        </div>
        <section className="text-center mt-[5%] grow pl-4">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            Already have a video?
          </h2>
          <Link to="/convert-video" reloadDocument>
            <Button variant="gradient" className="w-fit">
              Convert it to mp3
            </Button>
          </Link>
        </section>
      </main>
      <footer className="text-center mt-auto">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Source code:{" "}
          <a href="https://github.com/sebastianwd/ez-yt-downloader">GitHub</a>
        </p>
      </footer>
    </div>
  );
};
