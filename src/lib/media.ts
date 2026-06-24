const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const MEDIA_PREFIX = "/media/";

/**
 * Convert backend media paths to direct backend URLs.
 * No more proxying through Next.js - images load directly from the backend.
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;

  // Already a full URL pointing to the backend
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Relative path - prepend the backend origin
  let pathname = path;
  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  return `${apiOrigin}${pathname}`;
}

export function backendMediaUrl(pathSegments: string[]) {
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  const safePath = pathSegments.map((part) => encodeURIComponent(part)).join("/");
  return `${apiOrigin}${MEDIA_PREFIX}${safePath}`;
}
