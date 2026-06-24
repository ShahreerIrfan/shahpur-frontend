/**
 * Server-side API utilities.
 * These functions are meant to be called from Server Components only.
 * They use the internal backend URL for faster Docker-to-Docker communication.
 */

const SERVER_API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchSlidesServer() {
  try {
    const res = await fetch(`${SERVER_API_URL}/core/sliders/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

export async function fetchSettingsServer() {
  try {
    const res = await fetch(`${SERVER_API_URL}/core/settings/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
