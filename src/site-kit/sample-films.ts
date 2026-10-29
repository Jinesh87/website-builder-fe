/** Free, publicly hosted demo clips used as placeholder portfolio films. */
export const SAMPLE_FILM_VIDEOS = {
  oceans: "https://vjs.zencdn.net/v/oceans.mp4",
  flower: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  friday: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
  jellyfish: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
  bunny: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
  bunnyTrailer: "https://media.w3.org/2010/05/bunny/trailer.mp4",
  sintel: "https://media.w3.org/2010/05/sintel/trailer.mp4",
  street: "https://media.w3.org/2010/05/video/movie_300.mp4",
} as const;

/**
 * Played by film frames whose `videoUrl` was never set. An empty string means
 * the video was removed on purpose, so no default is used.
 */
export const DEFAULT_FILM_VIDEO_URL = SAMPLE_FILM_VIDEOS.oceans;
