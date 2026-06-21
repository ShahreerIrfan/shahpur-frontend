"use client";

import { useEffect } from "react";

const FAVICON_SELECTORS = [
  "link[rel='icon']",
  "link[rel='shortcut icon']",
  "link[rel='apple-touch-icon']",
];

function setFavicon(href: string) {
  if (!href) return;

  for (const selector of FAVICON_SELECTORS) {
    document.querySelectorAll<HTMLLinkElement>(selector).forEach((node) => node.remove());
  }

  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/png";
  icon.href = href;
  icon.dataset.dynamicFavicon = "true";

  const shortcut = document.createElement("link");
  shortcut.rel = "shortcut icon";
  shortcut.type = "image/png";
  shortcut.href = href;
  shortcut.dataset.dynamicFavicon = "true";

  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = href;
  apple.dataset.dynamicFavicon = "true";

  document.head.append(icon, shortcut, apple);
}

async function syncFavicon() {
  setFavicon(`/favicon.ico?v=${Date.now()}`);
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
