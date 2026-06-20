import { API_URL } from "@/lib/api";

export interface BookListItem {
  id: number;
  slug: string;
  title: string;
  category: number | null;
  category_display: string;
  author: number | null;
  author_name: string;
  translator: string;
  publisher: string;
  publication_year: string;
  language: string;
  language_display: string;
  pages: number;
  short_description: string;
  cover_image: string | null;
  pdf_file: string;
  is_published: boolean;
  is_featured: boolean;
  show_on_homepage: boolean;
  download_count: number;
  view_count: number;
}

export interface BookDetail extends BookListItem {
  author_title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BookCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
  books_count: number;
}

export interface BookAuthor {
  id: number;
  name: string;
  slug: string;
  title: string;
  biography: string;
  photo: string | null;
  is_active: boolean;
  order: number;
  books_count: number;
}

export const BOOK_LANGUAGES = [
  { value: "bn", label: "বাংলা" },
  { value: "ar", label: "আরবি" },
  { value: "en", label: "ইংরেজি" },
  { value: "ur", label: "উর্দু" },
  { value: "other", label: "অন্যান্য" },
];

export function mediaUrl(path: string | null) {
  if (!path) return "";
  const baseUrl = API_URL.replace("/api", "");
  if (path.includes("localhost:8000")) {
    return path.replace("http://localhost:8000", baseUrl);
  }
  if (!path.startsWith("http")) {
    return `${baseUrl}${path}`;
  }
  return path;
}

export function bookLanguageLabel(language: string) {
  return BOOK_LANGUAGES.find((item) => item.value === language)?.label || language;
}
