import getYoutubeId from "get-youtube-id";
export const ytGetId = (url: string) => {
  try {
    const videoId = getYoutubeId(url);
    if (videoId) {
      return {
        id: videoId,
      };
    }
    return null;
  } catch (e) {
    console.error(`Error getting YouTube ID for ${url}`, e);
    return null;
  }
};
