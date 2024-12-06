export const createFFmpeg = async () => {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");
  const ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  return ffmpeg;
};