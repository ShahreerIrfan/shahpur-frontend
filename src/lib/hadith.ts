export interface ApiList<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export interface HadithCollection {
  id: number;
  name: string;
  slug: string;
  short_name: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithBook {
  id: number;
  collection: number;
  collection_name: string;
  name: string;
  slug: string;
  arabic_name: string;
  book_number: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithChapter {
  id: number;
  book: number;
  book_name: string;
  collection_name: string;
  title: string;
  slug: string;
  arabic_title: string;
  chapter_number: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithNarrator {
  id: number;
  name: string;
  slug: string;
  arabic_name: string;
  biography: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithGrade {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithTopic {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count: number;
}

export interface HadithTopicDisplay {
  id: number;
  name: string;
  slug: string;
}

export interface HadithListItem {
  id: number;
  slug: string;
  title: string;
  hadith_number: string;
  reference: string;
  collection: number | null;
  collection_name: string;
  book: number | null;
  book_name: string;
  chapter: number | null;
  chapter_title: string;
  narrator: number | null;
  narrator_name: string;
  grade: number | null;
  grade_name: string;
  grade_color: string;
  topics: number[];
  topics_display: HadithTopicDisplay[];
  arabic_text: string;
  bangla_text: string;
  source_note: string;
  is_published: boolean;
  is_featured: boolean;
  show_on_homepage: boolean;
  view_count: number;
  created_at: string;
}

export interface HadithDetail extends HadithListItem {
  book_arabic_name: string;
  chapter_arabic_title: string;
  english_text: string;
  explanation: string;
  keywords: string;
  updated_at: string;
}
