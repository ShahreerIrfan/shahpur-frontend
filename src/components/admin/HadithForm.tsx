"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaBook, FaSave, FaSpinner } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import {
  HADITH_GRADES,
  HadithChapter,
  HadithCollection,
  HadithDetail,
  HadithKitab,
  HadithNarrator,
  HadithTaxonomy,
} from "@/lib/hadiths";

interface HadithFormProps {
  hadithId?: string;
}

export default function HadithForm({ hadithId }: HadithFormProps) {
  const router = useRouter();
  const isEdit = Boolean(hadithId);
  const [loading, setLoading] = useState(Boolean(hadithId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [taxonomies, setTaxonomies] = useState<HadithTaxonomy[]>([]);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [kitabs, setKitabs] = useState<HadithKitab[]>([]);
  const [chapters, setChapters] = useState<HadithChapter[]>([]);
  const [narrators, setNarrators] = useState<HadithNarrator[]>([]);

  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedKitab, setSelectedKitab] = useState("");
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<number[]>([]);

  const fetchKitabs = useCallback(async (collectionId?: string) => {
    const url = collectionId
      ? `${API_URL}/hadiths/kitabs/?collection=${collectionId}`
      : `${API_URL}/hadiths/kitabs/`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setKitabs(Array.isArray(data) ? data : data.results || []);
    }
  }, []);

  const fetchChapters = useCallback(async (kitabId?: string) => {
    const url = kitabId
      ? `${API_URL}/hadiths/chapters/?kitab=${kitabId}`
      : `${API_URL}/hadiths/chapters/`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : data.results || []);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [taxRes, collRes, narratorRes] = await Promise.all([
          fetch(`${API_URL}/hadiths/taxonomies/`),
          fetch(`${API_URL}/hadiths/collections/`),
          fetch(`${API_URL}/hadiths/narrators/`),
        ]);
        if (taxRes.ok) {
          const data = await taxRes.json();
          setTaxonomies(Array.isArray(data) ? data : data.results || []);
        }
        if (collRes.ok) {
          const data = await collRes.json();
          setCollections(Array.isArray(data) ? data : data.results || []);
        }
        if (narratorRes.ok) {
          const data = await narratorRes.json();
          setNarrators(Array.isArray(data) ? data : data.results || []);
        }

        if (hadithId) {
          const res = await authFetch(`/hadiths/list/${hadithId}/`);
          if (res.ok) {
            const data = (await res.json()) as HadithDetail;
            setHadith(data);
            setSelectedCollection(data.collection ? String(data.collection) : "");
            setSelectedKitab(data.kitab ? String(data.kitab) : "");
            setSelectedTaxonomies(data.taxonomy_ids || []);
            if (data.collection) await fetchKitabs(String(data.collection));
            if (data.kitab) await fetchChapters(String(data.kitab));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [hadithId, fetchKitabs, fetchChapters]);

  const handleCollectionChange = (collId: string) => {
    setSelectedCollection(collId);
    setSelectedKitab("");
    setChapters([]);
    if (collId) void fetchKitabs(collId);
    else setKitabs([]);
  };

  const handleKitabChange = (kitabId: string) => {
    setSelectedKitab(kitabId);
    if (kitabId) void fetchChapters(kitabId);
    else setChapters([]);
  };

  const toggleTaxonomy = (id: number) => {
    setSelectedTaxonomies((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value || "";
    const isChecked = (name: string) => {
      const el = form.elements.namedItem(name);
      return el instanceof HTMLInputElement && el.checked;
    };

    const payload: Record<string, unknown> = {
      title: get("title"),
      hadith_number: get("hadith_number"),
      reference: get("reference"),
      collection: selectedCollection ? Number(selectedCollection) : null,
      kitab: selectedKitab ? Number(selectedKitab) : null,
      chapter: get("chapter") ? Number(get("chapter")) : null,
      narrator: get("narrator") ? Number(get("narrator")) : null,
      grade: get("grade"),
      taxonomy_ids: selectedTaxonomies,
      arabic_text: get("arabic_text"),
      bangla_translation: get("bangla_translation"),
      english_translation: get("english_translation"),
      explanation: get("explanation"),
      source_note: get("source_note"),
      keywords: get("keywords"),
      is_published: isChecked("is_published"),
      is_featured: isChecked("is_featured"),
      show_on_homepage: isChecked("show_on_homepage"),
    };

    try {
      const res = await authFetch(
        isEdit ? `/hadiths/list/${hadithId}/` : "/hadiths/list/",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        const message = errorData
          ? Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join("; ")
          : "হাদিস সংরক্ষণ করতে সমস্যা হয়েছে।";
        throw new Error(message);
      }

      router.push("/admin/hadiths");
    } catch (err) {
      setError(err instanceof Error ? err.message : "হাদিস সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const val = (field: keyof HadithDetail) => hadith?.[field] ?? "";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? "হাদিস সম্পাদনা" : "নতুন হাদিস যোগ করুন"}</h1>
          <p className="text-xs text-gray-400 mt-0.5">সহীহ হাদিসের তথ্য পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
          <div className="space-y-5">
            {/* হাদিস তথ্য */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <FaBook className="text-primary-500 w-4 h-4" />
                <h3 className="font-semibold text-gray-800 text-sm">হাদিস তথ্য</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শিরোনাম *</label>
                    <input name="title" defaultValue={String(val("title"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">হাদিস নম্বর *</label>
                    <input name="hadith_number" defaultValue={String(val("hadith_number"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">রেফারেন্স</label>
                  <input name="reference" defaultValue={String(val("reference"))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="সহীহ বুখারী, আদব অধ্যায়" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">সংকলন</label>
                    <select value={selectedCollection} onChange={(e) => handleCollectionChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">কিতাব</label>
                    <select value={selectedKitab} onChange={(e) => handleKitabChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {kitabs.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">পরিচ্ছেদ</label>
                    <select name="chapter" defaultValue={hadith?.chapter ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">রাবী</label>
                    <select name="narrator" defaultValue={hadith?.narrator ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {narrators.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">মান/গ্রেড</label>
                    <select name="grade" defaultValue={String(val("grade") || "sahih")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      {HADITH_GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
                {/* বিষয় - Multi-select with checkboxes */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বিষয়</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {taxonomies.length === 0 && <p className="text-xs text-gray-400">কোনো বিষয় পাওয়া যায়নি</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {taxonomies.map((tax) => (
                        <label key={tax.id} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1.5 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedTaxonomies.includes(tax.id)}
                            onChange={() => toggleTaxonomy(tax.id)}
                            className="w-4 h-4 accent-primary-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{tax.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {selectedTaxonomies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedTaxonomies.map((id) => {
                        const tax = taxonomies.find((t) => t.id === id);
                        return tax ? (
                          <span key={id} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {tax.name}
                            <button type="button" onClick={() => toggleTaxonomy(id)} className="text-primary-400 hover:text-primary-600">&times;</button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* হাদিসের মূল কনটেন্ট */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-800 text-sm">হাদিসের মূল কনটেন্ট</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">আরবি হাদিস *</label>
                  <textarea name="arabic_text" defaultValue={String(val("arabic_text"))} required rows={5} dir="rtl" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none font-arabic text-lg leading-loose"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বাংলা অনুবাদ *</label>
                  <textarea name="bangla_translation" defaultValue={String(val("bangla_translation"))} required rows={6} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ইংরেজি অনুবাদ</label>
                  <textarea name="english_translation" defaultValue={String(val("english_translation"))} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ব্যাখ্যা/নোট</label>
                  <textarea name="explanation" defaultValue={String(val("explanation"))} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">উৎস নোট</label>
                  <textarea name="source_note" defaultValue={String(val("source_note"))} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">কীওয়ার্ড</label>
                  <input name="keywords" defaultValue={String(val("keywords"))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="কমা দিয়ে আলাদা করুন" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">প্রকাশনা</h4>
              <div className="space-y-3 mb-4">
                <label className="flex items-center justify-between text-xs text-gray-600">
                  প্রকাশিত
                  <input name="is_published" type="checkbox" defaultChecked={hadith?.is_published ?? true} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  ফিচার্ড
                  <input name="is_featured" type="checkbox" defaultChecked={hadith?.is_featured ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  হোমপেজে দেখান
                  <input name="show_on_homepage" type="checkbox" defaultChecked={hadith?.show_on_homepage ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                <FaSave className="w-3.5 h-3.5" />
                {saving ? "সংরক্ষণ হচ্ছে..." : isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
