/* eslint-disable jsx-a11y/media-has-caption */
import { fetchFile } from "@ffmpeg/util";
import { useFetcher } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Arrow8 } from "~/components/arrow";
import { VideoDropzone } from "~/components/dropzone";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { createFFmpeg } from "~/lib/ffmpeg";

export const IndexPage = () => {
  const fetcher = useFetcher<string>();

  const actionData = fetcher.data;

  const [videoSrc, setVideoSrc] = useState("");

  const [converting, setConverting] = useState(false);

  const ffmpegRef = useRef<Awaited<ReturnType<typeof createFFmpeg>>>();

  useEffect(() => {
    if (actionData) {
      setVideoSrc(actionData);
    }
  }, [actionData]);

  const onUpload: ComponentProps<typeof VideoDropzone>["onUpload"] = async (
    video
  ) => {
    setConverting(true);

    if (!ffmpegRef.current) {
      ffmpegRef.current = await createFFmpeg();
    }

    const ffmpeg = ffmpegRef.current;

    if (!ffmpeg || !video) {
      setConverting(false);
      console.error("Error converting video to MP3: ffmpeg or video is null");
      return;
    }

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp3";

    try {
      await ffmpeg.writeFile(inputFileName, await fetchFile(video));

      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-vn",
        "-acodec",
        "libmp3lame",
        outputFileName,
      ]);

      // Read the MP3 data from the FFmpeg virtual file system
      const mp3Data = await ffmpeg.readFile(outputFileName);
      const data = new Uint8Array(mp3Data as ArrayBuffer);

      // Create a Blob URL for the MP3 data
      const mp3BlobUrl = URL.createObjectURL(
        new Blob([data.buffer], { type: "audio/mpeg" })
      );

      const link = document.createElement("a");
      link.href = mp3BlobUrl;
      link.download = `${video.name}.mp3`; // Set the desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("MP3 Blob URL:", mp3BlobUrl);
    } catch (error) {
      console.error("Error converting video to MP3:", error);
      alert("Error converting video to MP3");
    } finally {
      setConverting(false);
    }
  };

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
            {videoSrc && (
              <>
                <div className="relative">
                  <video
                    controls
                    src={videoSrc}
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
          <p className="text-base mb-3">Convert it to mp3:</p>
          <VideoDropzone onUpload={onUpload} disabled={converting} />
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
