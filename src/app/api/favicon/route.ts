import { API_URL } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SiteSettings = {
  favicon?: string | null;
};

const DEFAULT_FAVICON = "site/shahpur-darbar-favicon-round.png";

function backendMediaUrl(path: string) {
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/media/")) {
    return `${apiOrigin}${path}`;
  }

  if (path.startsWith("media/")) {
    return `${apiOrigin}/${path}`;
  }

  return `${apiOrigin}/media/${path.replace(/^\/+/, "")}`;
}

async function currentFaviconUrl() {
  try {
    const settingsRes = await fetch(`${API_URL}/core/settings/`, { cache: "no-store" });
    if (!settingsRes.ok) return backendMediaUrl(DEFAULT_FAVICON);

    const settings = (await settingsRes.json()) as SiteSettings;
    return backendMediaUrl(settings.favicon || DEFAULT_FAVICON);
  } catch {
    return backendMediaUrl(DEFAULT_FAVICON);
  }
}

export async function GET() {
  const faviconUrl = await currentFaviconUrl();
  const upstream = await fetch(faviconUrl, { cache: "no-store" });

  if (!upstream.ok || !upstream.body) {
    return new Response("Favicon not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "image/png");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  headers.set("X-Robots-Tag", "noindex");

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}
