const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const MEDIA_PREFIX = "/media/";
const SECURE_MEDIA_PREFIX = "/secure-media/";

export function mediaUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:")) return path;

  let pathname = path;
  let search = "";

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const parsed = new URL(path);
      pathname = parsed.pathname;
      search = parsed.search;
    }
  } catch {
    return "";
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (!pathname.startsWith(MEDIA_PREFIX)) {
    return path;
  }

  const relativeMediaPath = pathname.slice(MEDIA_PREFIX.length);
  return `${SECURE_MEDIA_PREFIX}${relativeMediaPath}${search}`;
}

export function backendMediaUrl(pathSegments: string[]) {
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  const safePath = pathSegments.map((part) => encodeURIComponent(part)).join("/");
  return `${apiOrigin}${MEDIA_PREFIX}${safePath}`;
}
