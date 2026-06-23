"use client";

import { useEffect } from "react";

/**
 * FaviconSync - Updates the favicon dynamically.
 * 
 * IMPORTANT: We must NOT remove existing link elements that React/Next.js
 * manages via the metadata API. Removing them causes "Cannot read properties 
 * of null (reading 'removeChild')" errors that break client-side navigation.
 * 
 * Instead, we update existing link elements' href in-place, or create new
 * ones with a data attribute to identify them as ours.
 */
function setFavicon(href: string) {
  if (!href) return;

  const existingIcon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  const existingShortcut = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement | null;
  const existingApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;

  // Update existing elements in-place (don't remove them!)
  if (existingIcon) {
    existingIcon.href = href;
  } else {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.href = href;
    document.head.append(icon);
  }

  if (existingShortcut) {
    existingShortcut.href = href;
  } else {
    const shortcut = document.createElement("link");
    shortcut.rel = "shortcut icon";
    shortcut.type = "image/png";
    shortcut.href = href;
    document.head.append(shortcut);
  }

  if (existingApple) {
    existingApple.href = href;
  } else {
    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = href;
    document.head.append(apple);
  }
}

export default function FaviconSync() {
  useEffect(() => {
    setFavicon(`/favicon.ico?v=${Date.now()}`);
  }, []);

  return null;
}
