"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Fixes stale navigation after browser tab inactivity.
 * 
 * When a tab is hidden for more than 60s, the Next.js client router cache
 * goes stale. On return, the first click updates the URL but the RSC payload
 * fetch may stall. We solve this by calling router.refresh() ONCE when the
 * tab becomes visible again after being idle, which clears the stale cache
 * before the user clicks anything.
 */
export default function RouteChangeSync() {
  const router = useRouter();
  const pathname = usePathname();
  const hiddenAt = useRef(0);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Refresh router cache when tab becomes visible after inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current > 0) {
        const elapsed = Date.now() - hiddenAt.current;
        // If tab was hidden for more than 30 seconds, refresh the cache
        if (elapsed > 30_000) {
          router.refresh();
        }
        hiddenAt.current = 0;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
}
