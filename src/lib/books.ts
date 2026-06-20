import { API_URL } from "@/lib/api";

export interface BookListItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_display: string;
  author: string;
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
  description: string;
  created_at: string;
  updated_at: string;
}

export const BOOK_CATEGORIES = [
  { value: "quran", label: "কুরআন ও তাফসীর" },
  { value: "hadith", label: "হাদিস" },
  { value: "fiqh", label: "ফিকহ" },
  { value: "tasawwuf", label: "তাসাউফ" },
  { value: "biography", label: "জীবনী" },
  { value: "history", label: "ইতিহাস" },
  { value: "dua", label: "দোয়া ও আমল" },
  { value: "madrasha", label: "মাদ্রাসা পাঠ্য" },
  { value: "other", label: "অন্যান্য" },
];

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

export function bookCategoryLabel(category: string) {
  return BOOK_CATEGORIES.find((item) => item.value === category)?.label || category;
}

export function bookLanguageLabel(language: string) {
  return BOOK_LANGUAGES.find((item) => item.value === language)?.label || language;
}
