"use client";

import { useEffect } from "react";
import { fetchSiteSettings } from "@/lib/appearance";
import { mediaUrl } from "@/lib/media";

const FAVICON_SELECTOR = "link[rel='icon'][data-dynamic-favicon='true']";

function setFavicon(href: string) {
  if (!href) return;

  let link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.dataset.dynamicFavicon = "true";
    document.head.appendChild(link);
  }

  link.href = href;
}

async function syncFavicon() {
  try {
    const settings = await fetchSiteSettings();
    const favicon = mediaUrl(settings?.favicon);
    if (favicon) {
      setFavicon(`${favicon}${favicon.includes("?") ? "&" : "?"}v=${Date.now()}`);
    }
  } catch {
    // Keep the static favicon if the settings API is unavailable.
  }
}

export default function FaviconSync() {
  useEffect(() => {
    void syncFavicon();

    const handleRefresh = () => void syncFavicon();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("site-settings-updated", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("site-settings-updated", handleRefresh);
    };
  }, []);

  return null;
}
