"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaBookOpen, FaEye, FaFilter, FaQuoteRight, FaSearch, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Pagination from "@/components/ui/Pagination";
import PageHero from "@/components/ui/PageHero";
import { API_URL } from "@/lib/api";
import { ApiList, HadithCollection, HadithGrade, HadithListItem, HadithTopic, listFromResponse } from "@/lib/hadith";

const PAGE_SIZE = 15;

const initialQueryValue = (key: string) => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
};

export default function HadithArchivePage() {
  const [hadiths, setHadiths] = useState<HadithListItem[]>([]);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [grades, setGrades] = useState<HadithGrade[]>([]);
  const [topics, setTopics] = useState<HadithTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(() => initialQueryValue("collection"));
  const [grade, setGrade] = useState(() => initialQueryValue("grade"));
  const [topic, setTopic] = useState(() => initialQueryValue("topic"));
  const [search, setSearch] = useState(() => initialQueryValue("search"));
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadTaxonomies = async () => {
      const [collectionRes, gradeRes, topicRes] = await Promise.all([
        fetch(`${API_URL}/hadith/collections/`),
        fetch(`${API_URL}/hadith/grades/`),
        fetch(`${API_URL}/hadith/topics/`),
      ]);
      if (collectionRes.ok) setCollections(listFromResponse(await collectionRes.json()));
      if (gradeRes.ok) setGrades(listFromResponse(await gradeRes.json()));
      if (topicRes.ok) setTopics(listFromResponse(await topicRes.json()));
    };
    void loadTaxonomies();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (collection) params.set("collection", collection);
        if (grade) params.set("grade", grade);
        if (topic) params.set("topic", topic);
        if (search.trim()) params.set("search", search.trim());
        params.set("page", String(page));
        params.set("page_size", String(PAGE_SIZE));
        const res = await fetch(`${API_URL}/hadith/list/${params.toString() ? `?${params.toString()}` : ""}`);
        if (res.ok) {
          const data = (await res.json()) as HadithListItem[] | ApiList<HadithListItem>;
          setHadiths(listFromResponse(data));
          setCount(Array.isArray(data) ? data.length : data.count || 0);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [collection, grade, topic, search, page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };
  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero title="হাদিস" subtitle="রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের বাণী ও শিক্ষা — কুরআন ও সুন্নাহর আলোকে নির্বাচিত সহীহ হাদিস সংকলন" showBismillah={false} />
      <Breadcrumbs items={[{ label: "হাদিস" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 rounded-[2rem] border border-primary-100 bg-gradient-to-br from-white via-emerald-50/45 to-amber-50/30 p-4 md:p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-primary-100/70 pb-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
                <FaFilter className="h-3 w-3" /> হাদিস অনুসন্ধান
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-gray-950">সিহাহ সিত্তাহ ও নির্বাচিত সহীহ হাদিস</h2>
            </div>
            <p className="text-sm font-medium text-gray-500">মোট {count}টি হাদিস</p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_210px_180px_180px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => updateFilter(setSearch)(e.target.value)} className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" placeholder="হাদিস নম্বর, বিষয় বা অনুবাদ খুঁজুন..." />
          </div>
          <select value={collection} onChange={(e) => updateFilter(setCollection)(e.target.value)} className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100">
            <option value="">সকল সংকলন</option>
            {collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={grade} onChange={(e) => updateFilter(setGrade)(e.target.value)} className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100">
            <option value="">সকল মান</option>
            {grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={topic} onChange={(e) => updateFilter(setTopic)(e.target.value)} className="w-full rounded-2xl border border-primary-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100">
            <option value="">সকল বিষয়</option>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <FaSpinner className="w-8 h-8 text-primary-500 mx-auto animate-spin" />
          </div>
        ) : hadiths.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FaQuoteRight className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">কোনো হাদিস পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hadiths.map((item) => (
              <Link key={item.id} href={`/hadith/${item.id}`} className="group relative block overflow-hidden rounded-[2rem] border border-primary-100/70 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary-600 via-emerald-400 to-amber-300" />
                <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-primary-50/80 blur-2xl transition group-hover:bg-amber-100/70" />
                <div className="relative px-5 py-3 bg-gradient-to-r from-emerald-50 via-white to-amber-50/80 border-b border-primary-100/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-primary-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      <FaQuoteRight className="w-3 h-3" /> {item.hadith_number}
                    </span>
                    {item.topics_display && item.topics_display.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        {item.topics_display.slice(0, 3).map((t) => (
                          <span key={t.id} className="bg-white text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full text-[11px] font-semibold">{t.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {item.collection_name && <span className="font-medium">{item.collection_name}</span>}
                    {item.grade_name && <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-lg font-bold">{item.grade_name}</span>}
                    <span className="inline-flex items-center gap-1 text-gray-400"><FaEye className="w-3 h-3" /> {item.view_count}</span>
                  </div>
                </div>
                <div className="relative p-5 md:p-7">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-950 mb-1 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                      {item.chapter_title && <p className="text-sm text-primary-700 font-semibold mb-3">{item.chapter_title}</p>}
                      {item.narrator_name && <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5"><FaBookOpen className="w-3.5 h-3.5 text-primary-500" /> রাবী: {item.narrator_name}</p>}
                      <p className="text-gray-700 leading-loose line-clamp-5 text-justify">{item.bangla_text}</p>
                    </div>
                    {item.arabic_text && (
                      <div className="rounded-3xl border border-amber-100 bg-[linear-gradient(135deg,#fffaf0,#f0fdf4)] p-5 shadow-inner">
                        <p dir="rtl" className="text-2xl md:text-3xl text-gray-950 leading-loose line-clamp-4 font-serif text-right">{item.arabic_text}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-5 mt-5 border-t border-dashed border-primary-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <FaBookOpen className="w-3.5 h-3.5 text-primary-500" />
                      {item.book_name || item.reference || "বিস্তারিত"}
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 group-hover:gap-3 transition-all">
                      বিস্তারিত পড়ুন <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
              <p className="text-sm text-gray-500">মোট {count}টি হাদিস · পৃষ্ঠা {page} / {totalPages}</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
