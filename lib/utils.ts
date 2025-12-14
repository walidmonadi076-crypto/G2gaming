
export function getEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;

  // YouTube Short/Watch/Embed detection
  // Added parameters for cleanest possible look: 
  // controls=0 (hide bottom bar), modestbranding=1, rel=0 (no related at end), 
  // iv_load_policy=3 (no annotations), disablekb=1 (no keyboard), fs=0 (no fullscreen button)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|embed\/|shorts\/))([^&?]*)/);
  if (ytMatch && ytMatch[1]) {
    // Playlist parameter is required for loop to work on single videos
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${ytMatch[1]}&playsinline=1`;
  }

  // Vimeo detection
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&autopause=0&background=1`;
  }

  return null;
}

export function isVideoFile(url: string | undefined): boolean {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)$/i) !== null;
}
