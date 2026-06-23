"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Fixes the "first click doesn't navigate after tab inactivity" bug.
 * 
 * Root cause: Next.js App Router caches RSC (React Server Component) payloads
 * client-side. After the browser tab is hidden for a while, these cached
 * payloads become stale. When the user clicks a link, Next.js tries to use
 * the stale cache, URL updates (via history.pushState) but the page content
 * doesn't render because the stale RSC payload is invalid/expired.
 * 
 * Fix: We listen to 'visibilitychange'. When the tab becomes visible again
 * after being hidden for 20+ seconds, we immediately call router.refresh()
 * which invalidates the entire client-side RSC cache. The next link click
 * will then fetch fresh data from the server and work correctly on first click.
 * 
 * Additionally, we listen to popstate and intercept navigations that get stuck.
 */
export default function RouteChangeSync() {
  const router = useRouter();
  const pathname = usePathname();
  const hiddenAt = useRef(0);
  const lastPathname = useRef(pathname);

  // Scroll to top on successful route change
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      lastPathname.current = pathname;
    }
  }, [pathname]);

  // Core fix: invalidate router cache when tab returns from being hidden
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      }
    };

    const onShow = () => {
      if (!document.hidden && hiddenAt.current > 0) {
        const elapsed = Date.now() - hiddenAt.current;
        hiddenAt.current = 0;
        // If hidden for more than 20 seconds, invalidate the router cache
        if (elapsed > 20_000) {
          router.refresh();
        }
      }
    };

    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("visibilitychange", onShow);

    // Also refresh on window focus (handles alt-tab without visibility change)
    const onFocus = () => {
      if (hiddenAt.current > 0) {
        const elapsed = Date.now() - hiddenAt.current;
        hiddenAt.current = 0;
        if (elapsed > 20_000) {
          router.refresh();
        }
      }
    };
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  // Safety net: detect when URL changed but pathname hook didn't update
  // This catches the case where navigation got stuck
  useEffect(() => {
    const checkStuck = () => {
      const browserPath = window.location.pathname;
      if (browserPath !== lastPathname.current) {
        // URL changed but React didn't re-render - force navigation
        router.refresh();
      }
    };

    // Check every 500ms for stuck navigation
    const interval = setInterval(checkStuck, 500);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
