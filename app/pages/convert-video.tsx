import { fetchFile } from "@ffmpeg/util";
import { Link } from "@remix-run/react";
import { useRef, useState, type ComponentProps } from "react";
import { VideoDropzone } from "~/components/dropzone";
import { createFFmpeg } from "~/lib/ffmpeg";

export function ConvertVideoPage() {
  const [converting, setConverting] = useState(false);

  const ffmpegRef = useRef<Awaited<ReturnType<typeof createFFmpeg>>>();

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
    <main className="flex flex-col min-h-svh container mx-auto">
      <section className="text-center flex flex-col justify-center grow pl-4">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          Convert video to mp3
        </h2>
        <VideoDropzone onUpload={onUpload} disabled={converting} />
        <Link
          to="/"
          className="text-sm text-gray-500 dark:text-gray-400 underline mt-10"
        >
          ↩️ Back to homepage
        </Link>
      </section>
    </main>
  );
}
