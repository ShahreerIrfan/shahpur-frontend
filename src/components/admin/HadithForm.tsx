"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaBook, FaSave, FaSpinner } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import {
  HadithBook,
  HadithChapter,
  HadithCollection,
  HadithDetail,
  HadithGrade,
  HadithNarrator,
  HadithTopic,
  listFromResponse,
} from "@/lib/hadith";

interface HadithFormProps {
  hadithId?: string;
}

export default function HadithForm({ hadithId }: HadithFormProps) {
  const router = useRouter();
  const isEdit = Boolean(hadithId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [chapters, setChapters] = useState<HadithChapter[]>([]);
  const [narrators, setNarrators] = useState<HadithNarrator[]>([]);
  const [grades, setGrades] = useState<HadithGrade[]>([]);
  const [topics, setTopics] = useState<HadithTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const fetchOptions = useCallback(async () => {
    const [collRes, bookRes, chapterRes, narratorRes, gradeRes, topicRes] = await Promise.all([
      fetch(`${API_URL}/hadith/collections/`),
      fetch(`${API_URL}/hadith/books/`),
      fetch(`${API_URL}/hadith/chapters/`),
      fetch(`${API_URL}/hadith/narrators/`),
      fetch(`${API_URL}/hadith/grades/`),
      fetch(`${API_URL}/hadith/topics/`),
    ]);
    if (collRes.ok) setCollections(listFromResponse(await collRes.json()));
    if (bookRes.ok) setBooks(listFromResponse(await bookRes.json()));
    if (chapterRes.ok) setChapters(listFromResponse(await chapterRes.json()));
    if (narratorRes.ok) setNarrators(listFromResponse(await narratorRes.json()));
    if (gradeRes.ok) setGrades(listFromResponse(await gradeRes.json()));
    if (topicRes.ok) setTopics(listFromResponse(await topicRes.json()));
  }, []);

  const fetchHadith = useCallback(async () => {
    if (!hadithId) return;
    const res = await authFetch(`/hadith/list/${hadithId}/`);
    if (!res.ok) throw new Error("হাদিস লোড করতে সমস্যা হয়েছে।");
    const data = (await res.json()) as HadithDetail;
    setHadith(data);
    setSelectedTopics(data.topics || []);
  }, [hadithId]);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchOptions();
        if (hadithId) await fetchHadith();
      } catch (err) {
        setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [hadithId, fetchOptions, fetchHadith]);

  const toggleTopic = (id: number) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const isChecked = (name: string) => {
      const el = form.elements.namedItem(name);
      return el instanceof HTMLInputElement && el.checked;
    };

    data.set("is_published", isChecked("is_published") ? "true" : "false");
    data.set("is_featured", isChecked("is_featured") ? "true" : "false");
    data.set("show_on_homepage", isChecked("show_on_homepage") ? "true" : "false");

    // Clear empty FK fields
    ["collection", "book", "chapter", "narrator", "grade"].forEach((field) => {
      if (!data.get(field)) data.delete(field);
    });

    // Convert selected topics to comma-separated text for topics_text field
    const topicNames = selectedTopics
      .map((id) => topics.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    data.set("topics_text", topicNames);

    try {
      const res = await authFetch(isEdit ? `/hadith/list/${hadithId}/` : "/hadith/list/", {
        method: isEdit ? "PATCH" : "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        const message = errorData
          ? Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join("; ")
          : "হাদিস সংরক্ষণ করতে সমস্যা হয়েছে।";
        throw new Error(message);
      }

      router.push("/admin/hadith");
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
        <button type="button" onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
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
                    <select name="collection" defaultValue={hadith?.collection ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">কিতাব</label>
                    <select name="book" defaultValue={hadith?.book ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {books.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">পরিচ্ছেদ</label>
                    <select name="chapter" defaultValue={hadith?.chapter ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
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
                    <select name="grade" defaultValue={hadith?.grade ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">নির্বাচন করুন</option>
                      {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>
                {/* বিষয় - Multi-select with checkboxes */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বিষয়</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-52 overflow-y-auto">
                    {topics.length === 0 && <p className="text-xs text-gray-400">কোনো বিষয় পাওয়া যায়নি। প্রথমে বিষয় ট্যাক্সোনমি যোগ করুন।</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {topics.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-2 py-1.5 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(t.id)}
                            onChange={() => toggleTopic(t.id)}
                            className="w-4 h-4 accent-primary-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedTopics.map((id) => {
                        const t = topics.find((tp) => tp.id === id);
                        return t ? (
                          <span key={id} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {t.name}
                            <button type="button" onClick={() => toggleTopic(id)} className="text-primary-400 hover:text-primary-600">&times;</button>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">আরবি হাদিস</label>
                  <textarea name="arabic_text" defaultValue={String(val("arabic_text"))} rows={5} dir="rtl" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-lg outline-none focus:ring-2 focus:ring-primary-500 resize-y leading-loose font-serif"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বাংলা অনুবাদ *</label>
                  <textarea name="bangla_text" defaultValue={String(val("bangla_text"))} required rows={6} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y leading-relaxed"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ইংরেজি অনুবাদ</label>
                  <textarea name="english_text" defaultValue={String(val("english_text"))} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ব্যাখ্যা/নোট</label>
                  <textarea name="explanation" defaultValue={String(val("explanation"))} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">উৎস নোট</label>
                  <input name="source_note" defaultValue={String(val("source_note"))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
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
                {saving ? <FaSpinner className="w-3.5 h-3.5 animate-spin" /> : <FaSave className="w-3.5 h-3.5" />}
                {saving ? "সংরক্ষণ হচ্ছে..." : isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
