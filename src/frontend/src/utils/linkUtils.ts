/**
 * Utility functions for URL/link detection and processing.
 */

/** Extracts all URLs from a string. */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"'\\)]+/gi;
  return Array.from(new Set(text.match(urlRegex) ?? []));
}

/**
 * Extracts YouTube video ID from any common YouTube URL format.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("?")[0] || null;
    }
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.slice("/shorts/".length).split("?")[0] || null;
      }
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.slice("/embed/".length).split("?")[0] || null;
      }
      return u.searchParams.get("v");
    }
  } catch {
    // not a valid URL
  }
  return null;
}

/** Returns a clean domain label from a URL (e.g. "twitter.com"). */
export function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
