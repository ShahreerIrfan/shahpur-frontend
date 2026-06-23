"use client";

/**
 * template.tsx is re-mounted on every navigation unlike layout.tsx.
 * This ensures child components always get fresh state after route changes,
 * preventing the stale-view issue where URL changes but content doesn't update
 * (especially after the browser tab was inactive for a few minutes).
 */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
