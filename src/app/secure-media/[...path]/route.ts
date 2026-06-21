import { NextRequest } from "next/server";
import { backendMediaUrl } from "@/lib/media";

export const runtime = "nodejs";

const FORWARDED_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "last-modified",
  "etag",
  "content-disposition",
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  if (!path?.length || path.some((part) => part === ".." || part.includes("\\"))) {
    return new Response("Invalid media path", { status: 400 });
  }

  const upstreamUrl = new URL(backendMediaUrl(path));
  upstreamUrl.search = request.nextUrl.search;

  const upstream = await fetch(upstreamUrl, {
    headers: {
      ...(request.headers.get("range") ? { Range: request.headers.get("range")! } : {}),
      ...(request.headers.get("if-none-match") ? { "If-None-Match": request.headers.get("if-none-match")! } : {}),
      ...(request.headers.get("if-modified-since") ? { "If-Modified-Since": request.headers.get("if-modified-since")! } : {}),
    },
    cache: "no-store",
  });

  const headers = new Headers();
  for (const header of FORWARDED_HEADERS) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }
  headers.set("Cache-Control", "private, max-age=300");
  headers.set("X-Robots-Tag", "noindex");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
