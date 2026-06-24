"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaBookOpen, FaEye, FaFeatherAlt, FaQuoteRight, FaSpinner, FaUserEdit } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/lib/api";
import { HadithDetail } from "@/lib/hadith";

export default function HadithDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/hadith/list/${id}/`);
        if (res.ok) setHadith((await res.json()) as HadithDetail);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!hadith) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaQuoteRight className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">হাদিসটি পাওয়া যায়নি</p>
          <Link href="/hadith" className="inline-block mt-4 text-primary-600 text-sm font-semibold">হাদিসে ফিরে যান</Link>
        </div>
      </div>
    );
  }

  const formatDate = (value: string) => {
    if (!value) return "উল্লেখ নেই";
    return new Date(value).toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const gradeBadgeClass = (color: string) => {
    const normalized = (color || "").toLowerCase();
    if (normalized.includes("blue")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (normalized.includes("amber") || normalized.includes("yellow")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (normalized.includes("red")) return "bg-red-100 text-red-800 border-red-200";
    if (normalized.includes("gray") || normalized.includes("grey")) return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  };
  const gradeBadge = hadith.grade_name ? (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${gradeBadgeClass(hadith.grade_color)}`}>
      {hadith.grade_name}
    </span>
  ) : null;
  const metaItems = [
    ["শিরোনাম", hadith.title],
    ["স্লাগ", hadith.slug],
    ["হাদিস নম্বর", hadith.hadith_number],
    ["রেফারেন্স", hadith.reference],
    ["সংকলন", hadith.collection_name],
    ["কিতাব", hadith.book_name],
    ["কিতাবের আরবি নাম", hadith.book_arabic_name],
    ["পরিচ্ছেদ", hadith.chapter_title],
    ["পরিচ্ছেদের আরবি নাম", hadith.chapter_arabic_title],
    ["রাবী", hadith.narrator_name],
    ["মান/গ্রেড", hadith.grade_name],
    ["উৎস নোট", hadith.source_note],
    ["কীওয়ার্ড", hadith.keywords],
    ["ভিউ সংখ্যা", String(hadith.view_count)],
    ["আপলোড করা হয়েছে", formatDate(hadith.created_at)],
    ["সর্বশেষ হালনাগাদ", formatDate(hadith.updated_at)],
  ];

  return (
    <div className="min-h-screen bg-[#f7faf7] pb-20">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,#043f2e,#00533d_48%,#0f2f25)] py-16 text-white">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/hadith" className="inline-flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider mb-6 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full border border-white/20">
            <FaArrowLeft className="w-3 h-3" /> হাদিস তালিকায় ফিরে যান
          </Link>
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold">হাদিস {hadith.hadith_number}</span>
              {gradeBadge}
              {hadith.collection_name && <span className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">{hadith.collection_name}</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">{hadith.title}</h1>
            {hadith.chapter_title && <p className="max-w-3xl text-primary-50 text-lg leading-relaxed">{hadith.chapter_title}</p>}
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: "হাদিস", url: "/hadith" }, { label: hadith.title }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <article className="overflow-hidden rounded-[2rem] border border-primary-100 bg-white shadow-xl">
          <div className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-5 py-4">
            <div className="absolute right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-primary-100/40 blur-2xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 bg-primary-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <FaQuoteRight className="w-3 h-3" /> {hadith.hadith_number}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {hadith.reference && <span>{hadith.reference}</span>}
              <span className="inline-flex items-center gap-1"><FaEye className="w-3 h-3" /> {hadith.view_count} পাঠ</span>
            </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_0.92fr]">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <FaBookOpen className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">বাংলা অনুবাদ</h2>
                </div>
                <p className="text-gray-800 leading-loose whitespace-pre-line text-justify">{hadith.bangla_text}</p>
              </div>

              {hadith.arabic_text && (
                <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-[linear-gradient(135deg,#fffbeb,#ecfdf5)] p-5 md:p-6 shadow-inner">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-amber-200/60" />
                  <div className="relative flex items-center gap-2 mb-4 justify-end">
                    <h2 className="text-xl font-bold text-gray-900">النص العربي</h2>
                    <div className="w-9 h-9 rounded-xl bg-white text-primary-600 flex items-center justify-center shadow-sm">
                      <FaQuoteRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p dir="rtl" className="relative text-2xl md:text-3xl text-gray-950 leading-loose whitespace-pre-line font-serif">{hadith.arabic_text}</p>
                </div>
              )}
            </div>

            {hadith.english_text && (
              <div className="mt-7 rounded-3xl border border-gray-100 bg-gray-50/70 p-5 md:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">English Translation</h2>
                <p className="text-gray-700 leading-loose whitespace-pre-line">{hadith.english_text}</p>
              </div>
            )}

            {hadith.explanation && (
              <div className="mt-7 bg-primary-50/70 border border-primary-100 rounded-3xl p-5 md:p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-3">
                  <FaFeatherAlt className="h-4 w-4 text-primary-600" /> ব্যাখ্যা/নোট
                </h2>
                <p className="text-gray-700 leading-loose whitespace-pre-line text-justify">{hadith.explanation}</p>
              </div>
            )}
          </div>
        </article>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-primary-100 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-primary-100 bg-gradient-to-r from-white to-emerald-50 flex items-center gap-2">
            <FaUserEdit className="w-4 h-4 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">হাদিসের পরিচিতি</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {metaItems.map(([label, text]) => (
              <div key={label} className="p-5 border-b border-r border-gray-50">
                <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
                {label === "মান/গ্রেড" && gradeBadge ? (
                  gradeBadge
                ) : (
                  <p className="font-bold text-gray-800 whitespace-pre-line break-words">{text || "উল্লেখ নেই"}</p>
                )}
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">বিষয়</p>
            <div className="flex flex-wrap gap-2">
              {hadith.topics_display.length > 0 ? hadith.topics_display.map((topic) => (
                <Link key={topic.id} href={`/hadith?topic=${topic.id}`} className="bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-full text-xs font-bold">
                  {topic.name}
                </Link>
              )) : <span className="text-sm text-gray-400">কোনো বিষয় যুক্ত নেই</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
