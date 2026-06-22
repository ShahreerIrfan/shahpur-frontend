"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RouteChangeSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    if (previousUrl.current && previousUrl.current !== currentUrl) {
      router.refresh();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    previousUrl.current = currentUrl;
  }, [pathname, router, searchParams]);

  return null;
}
