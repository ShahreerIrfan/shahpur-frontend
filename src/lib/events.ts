import { mediaUrl as secureMediaUrl } from "@/lib/media";

export interface EventPhoto {
  id: number;
  event: number;
  image: string;
  caption: string;
  order: number;
}

export interface EventSpeaker {
  name: string;
  title?: string;
  topic?: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface EventListItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  short_description: string;
  poster: string | null;
  hijri_date: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string;
  district_name: string;
  upazila_name: string;
  is_published: boolean;
  is_featured: boolean;
  show_on_homepage: boolean;
}

export interface EventDetail extends EventListItem {
  description: string;
  full_address: string;
  district: number | null;
  upazila: number | null;
  google_map_link: string;
  related_madrasha: number | null;
  related_khankah: number | null;
  related_madrasha_name: string;
  related_khankah_name: string;
  speakers: EventSpeaker[];
  schedule: EventScheduleItem[];
  photos: EventPhoto[];
}

export interface District {
  id: number;
  name: string;
}

export interface Upazila {
  id: number;
  name: string;
  district: number;
}

export interface RelatedMadrasha {
  id: number;
  madrasha_name: string;
}

export interface RelatedKhankah {
  id: number;
  khankah_name: string;
}

export const EVENT_CATEGORIES = [
  { value: "urs", label: "ওরশ শরীফ" },
  { value: "mahfil", label: "মাহফিল" },
  { value: "milad", label: "মিলাদ" },
  { value: "zikr", label: "জিকির মাহফিল" },
  { value: "iftar", label: "ইফতার মাহফিল" },
  { value: "qurbani", label: "কুরবানী কার্যক্রম" },
  { value: "dua", label: "দোয়া মাহফিল" },
  { value: "madrasha", label: "মাদ্রাসা অনুষ্ঠান" },
  { value: "other", label: "অন্যান্য" },
];

export const EVENT_STATUSES = [
  { value: "upcoming", label: "আসন্ন" },
  { value: "ongoing", label: "চলমান" },
  { value: "completed", label: "সম্পন্ন" },
  { value: "cancelled", label: "বাতিল" },
];

export function mediaUrl(path: string | null) {
  return secureMediaUrl(path);
}

export function formatDateBn(date: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

export function eventStatusLabel(status: string) {
  return EVENT_STATUSES.find((item) => item.value === status)?.label || status;
}

export function eventCategoryLabel(category: string) {
  return EVENT_CATEGORIES.find((item) => item.value === category)?.label || category;
}
