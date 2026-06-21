import { API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface ApiList<T> {
  results?: T[];
}

export interface HomeSlide {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  stat_one_value: string;
  stat_one_label: string;
  stat_two_value: string;
  stat_two_label: string;
  stat_three_value: string;
  stat_three_label: string;
  link: string;
  order: number;
  is_active: boolean;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_name_en: string;
  tagline: string;
  logo: string | null;
  favicon: string | null;
  phone: string;
  email: string;
  address: string;
  facebook_url: string;
  youtube_url: string;
  about_text: string;
}

export function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export function slideImageUrl(slide: Pick<HomeSlide, "image">) {
  return mediaUrl(slide.image) || "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2000&auto=format";
}

export async function fetchHomeSlides() {
  const res = await fetch(`${API_URL}/core/sliders/`);
  if (!res.ok) return [];
  const data = (await res.json()) as HomeSlide[] | ApiList<HomeSlide>;
  return listFromResponse(data);
}

export async function fetchSiteSettings() {
  const res = await fetch(`${API_URL}/core/settings/`);
  if (!res.ok) return null;
  return (await res.json()) as SiteSettings;
}
