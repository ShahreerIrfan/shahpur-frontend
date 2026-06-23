"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Simple route change handler - scrolls to top on navigation.
 * Navigation reliability is handled by SpaLink component which uses
 * router.push() directly instead of Next.js Link prefetch mechanism.
 */
export default function RouteChangeSync() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
