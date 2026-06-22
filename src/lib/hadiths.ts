export interface HadithTaxonomy {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count?: number;
}

export interface HadithCollection {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  order: number;
  hadiths_count?: number;
}

export interface HadithKitab {
  id: number;
  name: string;
  slug: string;
  collection: number;
  collection_name: string;
  order: number;
}

export interface HadithChapter {
  id: number;
  name: string;
  slug: string;
  kitab: number;
  kitab_name: string;
  order: number;
}

export interface HadithNarrator {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  hadiths_count?: number;
}

export interface HadithListItem {
  id: number;
  slug: string;
  title: string;
  hadith_number: string;
  reference: string;
  collection: number | null;
  collection_name: string;
  narrator: number | null;
  narrator_name: string;
  grade: string;
  grade_display: string;
  taxonomy_names: string[];
  bangla_translation: string;
  is_published: boolean;
  is_featured: boolean;
  show_on_homepage: boolean;
  view_count: number;
  created_at: string;
}

export interface HadithDetail extends HadithListItem {
  kitab: number | null;
  kitab_name: string;
  chapter: number | null;
  chapter_name: string;
  arabic_text: string;
  english_translation: string;
  explanation: string;
  source_note: string;
  keywords: string;
  taxonomy_ids: number[];
  taxonomy_names: string[];
  updated_at: string;
}

export const HADITH_GRADES = [
  { value: "sahih", label: "সহীহ" },
  { value: "hasan", label: "হাসান" },
  { value: "daif", label: "দঈফ" },
  { value: "mawdu", label: "মাউযূ" },
  { value: "sahih_lighairihi", label: "সহীহ লি গাইরিহী" },
  { value: "hasan_lighairihi", label: "হাসান লি গাইরিহী" },
];

export function gradeLabel(grade: string) {
  return HADITH_GRADES.find((g) => g.value === grade)?.label || grade;
}
