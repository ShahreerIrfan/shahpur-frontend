"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaBookOpen, FaSave, FaSpinner } from "react-icons/fa";
import { authFetch } from "@/lib/api";
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
  const [loading, setLoading] = useState(Boolean(hadithId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [chapters, setChapters] = useState<HadithChapter[]>([]);
  const [narrators, setNarrators] = useState<HadithNarrator[]>([]);
  const [grades, setGrades] = useState<HadithGrade[]>([]);
  const [topics, setTopics] = useState<HadithTopic[]>([]);

  const fetchOptions = useCallback(async () => {
    const [collectionRes, bookRes, chapterRes, narratorRes, gradeRes, topicRes] = await Promise.all([
      authFetch("/hadith/collections/"),
      authFetch("/hadith/books/"),
      authFetch("/hadith/chapters/"),
      authFetch("/hadith/narrators/"),
      authFetch("/hadith/grades/"),
      authFetch("/hadith/topics/"),
    ]);

    if (collectionRes.ok) setCollections(listFromResponse(await collectionRes.json()));
    if (bookRes.ok) setBooks(listFromResponse(await bookRes.json()));
    if (chapterRes.ok) setChapters(listFromResponse(await chapterRes.json()));
    if (narratorRes.ok) setNarrators(listFromResponse(await narratorRes.json()));
    if (gradeRes.ok) setGrades(listFromResponse(await gradeRes.json()));
    if (topicRes.ok) setTopics(listFromResponse(await topicRes.json()));
  }, []);

  const fetchHadith = useCallback(async () => {
    if (!hadithId) return;
    const res = await authFetch(`/hadith/list/${hadithId}/`);
    if (!res.ok) throw new Error("হাদিসের তথ্য লোড করতে সমস্যা হয়েছে।");
    setHadith((await res.json()) as HadithDetail);
  }, [hadithId]);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchOptions();
        await fetchHadith();
      } catch (err) {
        setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [fetchHadith, fetchOptions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const isChecked = (name: string) => {
      const item = form.elements.namedItem(name);
      return item instanceof HTMLInputElement && item.checked;
    };

    data.set("is_published", isChecked("is_published") ? "true" : "false");
    data.set("is_featured", isChecked("is_featured") ? "true" : "false");
    data.set("show_on_homepage", isChecked("show_on_homepage") ? "true" : "false");

    ["collection", "book", "chapter", "narrator", "grade"].forEach((field) => {
      if (!data.get(field)) data.delete(field);
    });

    if (data.getAll("topics").length === 0) {
      data.delete("topics");
    }

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

  const value = (field: keyof HadithDetail) => hadith?.[field] ?? "";
  const selectedTopics = (hadith?.topics || []).map(String);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? "হাদিস সম্পাদনা" : "নতুন হাদিস যোগ করুন"}</h1>
          <p className="text-xs text-gray-400 mt-0.5">আরবি, বাংলা অনুবাদ, পরিচ্ছেদ, রাবী ও মান পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <FaBookOpen className="text-primary-500 w-4 h-4" />
                <h3 className="font-semibold text-gray-800 text-sm">হাদিস তথ্য</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শিরোনাম *</label>
                    <input name="title" defaultValue={String(value("title"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none" placeholder="যেমন: সূর্যগ্রহণের সময় সালাত" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">হাদিস নম্বর *</label>
                    <input name="hadith_number" defaultValue={String(value("hadith_number"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none" placeholder="১০৪০" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">রেফারেন্স</label>
                  <input name="reference" defaultValue={String(value("reference"))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none" placeholder="সহীহ বুখারী, হাদিস ১০৪০" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">সংকলন</label>
                    <select name="collection" defaultValue={String(value("collection") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">সংকলন নির্বাচন করুন</option>
                      {collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">কিতাব</label>
                    <select name="book" defaultValue={String(value("book") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">কিতাব নির্বাচন করুন</option>
                      {books.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">পরিচ্ছেদ</label>
                    <select name="chapter" defaultValue={String(value("chapter") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">পরিচ্ছেদ নির্বাচন করুন</option>
                      {chapters.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">রাবী</label>
                    <select name="narrator" defaultValue={String(value("narrator") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">রাবী নির্বাচন করুন</option>
                      {narrators.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">মান/গ্রেড</label>
                    <select name="grade" defaultValue={String(value("grade") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">মান নির্বাচন করুন</option>
                      {grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বিষয়</label>
                  <select name="topics" multiple defaultValue={selectedTopics} className="w-full min-h-28 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    {topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">একাধিক নির্বাচন করতে Ctrl ধরে ক্লিক করুন।</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-800 text-sm">হাদিসের মূল কনটেন্ট</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">আরবি হাদিস</label>
                  <textarea name="arabic_text" defaultValue={String(value("arabic_text"))} dir="rtl" rows={6} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-2xl leading-loose outline-none focus:ring-2 focus:ring-primary-500 resize-y font-serif" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বাংলা অনুবাদ *</label>
                  <textarea name="bangla_text" defaultValue={String(value("bangla_text"))} required rows={7} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm leading-loose outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ইংরেজি অনুবাদ</label>
                  <textarea name="english_text" defaultValue={String(value("english_text"))} rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm leading-loose outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ব্যাখ্যা/নোট</label>
                  <textarea name="explanation" defaultValue={String(value("explanation"))} rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm leading-loose outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
                </div>
              </div>
            </div>
          </div>

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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h4 className="text-sm font-semibold text-gray-800">SEO / উৎস</h4>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">উৎস নোট</label>
                <input name="source_note" defaultValue={String(value("source_note"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="ইসলামিক ফাউন্ডেশন, অনলাইন প্রকাশনী..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">কীওয়ার্ড</label>
                <textarea name="keywords" defaultValue={String(value("keywords"))} rows={4} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="সালাত, সূর্যগ্রহণ, বুখারী" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
