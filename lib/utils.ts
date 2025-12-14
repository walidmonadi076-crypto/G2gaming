
export function getEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;

  // YouTube Short/Watch/Embed detection
  // Added parameters: controls=0, modestbranding=1, rel=0, iv_load_policy=3, disablekb=1, fs=0
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|embed\/|shorts\/))([^&?]*)/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&loop=1&playlist=${ytMatch[1]}`;
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
