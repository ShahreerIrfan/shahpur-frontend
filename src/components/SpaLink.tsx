"use client";

import { useCallback, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * SpaLink - A replacement for Next.js <Link> that uses router.push() directly.
 *
 * Next.js <Link> internally uses RSC payload prefetching which breaks after
 * browser tab inactivity in standalone Docker deployments behind Traefik.
 * 
 * This component renders a plain <a> tag and intercepts clicks to use
 * router.push() for navigation. router.push() doesn't rely on prefetched
 * cache and always triggers a fresh navigation.
 *
 * - Still does client-side SPA navigation (no page reload)
 * - Supports cmd/ctrl+click to open in new tab
 * - Supports right-click context menu
 * - Scrolls to top on navigation
 */
interface SpaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
}

export default function SpaLink({ href, onClick, children, ...props }: SpaLinkProps) {
    const router = useRouter();

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            // Let browser handle: new tab, middle click, modified clicks
            if (
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey ||
                e.button !== 0 ||
                props.target === "_blank"
            ) {
                return;
            }

            // Let browser handle external links
            if (href.startsWith("http") || href.startsWith("//") || href.startsWith("mailto:")) {
                return;
            }

            // Don't navigate to # links
            if (href === "#") {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            if (onClick) {
                onClick(e);
            }

            router.push(href);
        },
        [href, onClick, router, props.target]
    );

    return (
        <a href={href} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
