"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaBookOpen, FaEye, FaQuoteRight, FaSearch, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import { API_URL } from "@/lib/api";
import { HadithCollection, HadithGrade, HadithListItem, HadithTopic, listFromResponse } from "@/lib/hadith";

export default function HadithArchivePage() {
  const [hadiths, setHadiths] = useState<HadithListItem[]>([]);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [grades, setGrades] = useState<HadithGrade[]>([]);
  const [topics, setTopics] = useState<HadithTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCollection(params.get("collection") || "");
    setGrade(params.get("grade") || "");
    setTopic(params.get("topic") || "");
    setSearch(params.get("search") || "");
  }, []);

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
        const res = await fetch(`${API_URL}/hadith/list/${params.toString() ? `?${params.toString()}` : ""}`);
        if (res.ok) {
          setHadiths(listFromResponse(await res.json()));
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [collection, grade, topic, search]);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero title="হাদিস" subtitle="কুরআন ও সুন্নাহর আলোকে নির্বাচিত হাদিস সংগ্রহ" showBismillah={false} />
      <Breadcrumbs items={[{ label: "হাদিস" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 grid grid-cols-1 lg:grid-cols-[1fr_210px_180px_180px] gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="হাদিস নম্বর, বিষয় বা অনুবাদ খুঁজুন..." />
          </div>
          <select value={collection} onChange={(e) => setCollection(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল সংকলন</option>
            {collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল মান</option>
            {grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল বিষয়</option>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
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
          <div className="space-y-5">
            {hadiths.map((item) => (
              <Link key={item.id} href={`/hadith/${item.id}`} className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    <FaQuoteRight className="w-3 h-3" /> {item.hadith_number}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {item.collection_name && <span>{item.collection_name}</span>}
                    {item.grade_name && <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-lg font-semibold">{item.grade_name}</span>}
                    <span className="inline-flex items-center gap-1"><FaEye className="w-3 h-3" /> {item.view_count}</span>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{item.title}</h3>
                  {item.chapter_title && <p className="text-sm text-primary-700 font-semibold mb-3">{item.chapter_title}</p>}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <p className="text-gray-700 leading-loose line-clamp-4 text-justify">{item.bangla_text}</p>
                    {item.arabic_text && <p dir="rtl" className="text-2xl text-gray-900 leading-loose line-clamp-4 font-serif">{item.arabic_text}</p>}
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <FaBookOpen className="w-3.5 h-3.5 text-primary-500" />
                      {item.book_name || item.reference || "বিস্তারিত"}
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-primary-600">
                      বিস্তারিত পড়ুন <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
