"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaBook, FaEye, FaHashtag, FaSpinner, FaStar, FaTag } from "react-icons/fa";
import { API_URL } from "@/lib/api";
import { HadithDetail, gradeLabel } from "@/lib/hadiths";

export default function HadithDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [hadith, setHadith] = useState<HadithDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/hadiths/list/${id}/`);
                if (res.ok) {
                    setHadith((await res.json()) as HadithDetail);
                }
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    }

    if (!hadith) {
        return <div className="min-h-screen text-center py-20 text-gray-500">হাদিস পাওয়া যায়নি</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/40 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50/60 border-b border-primary-100 py-14 md:py-20">
                <div className="absolute inset-0 islamic-pattern opacity-90 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <Link href="/hadiths" className="inline-flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-6 bg-white/85 hover:bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
                        <FaArrowLeft className="w-2.5 h-2.5" /> সকল হাদিস
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">#{hadith.hadith_number}</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">{hadith.grade_display}</span>
                        {hadith.collection_name && <span className="bg-white text-primary-700 border border-primary-100 px-3 py-1 rounded-full text-xs font-bold">{hadith.collection_name}</span>}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-primary-950 leading-tight mb-4">{hadith.title}</h1>
                    {hadith.reference && <p className="text-primary-900/70 text-sm">{hadith.reference}</p>}
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* আরবি হাদিস */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                                আরবি হাদিস
                            </h2>
                            <p className="text-gray-800 text-xl md:text-2xl leading-loose font-arabic text-right" dir="rtl">{hadith.arabic_text}</p>
                        </section>

                        {/* বাংলা অনুবাদ */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                                বাংলা অনুবাদ
                            </h2>
                            <p className="text-gray-700 leading-loose whitespace-pre-line text-justify">{hadith.bangla_translation}</p>
                        </section>

                        {/* ইংরেজি অনুবাদ */}
                        {hadith.english_translation && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                    English Translation
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{hadith.english_translation}</p>
                            </section>
                        )}

                        {/* ব্যাখ্যা */}
                        {hadith.explanation && (
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                                    ব্যাখ্যা / নোট
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{hadith.explanation}</p>
                            </section>
                        )}

                        {/* উৎস নোট */}
                        {hadith.source_note && (
                            <section className="bg-primary-50 rounded-3xl border border-primary-100 p-6 md:p-8">
                                <h2 className="text-lg font-bold text-primary-900 mb-3">উৎস নোট</h2>
                                <p className="text-primary-800 leading-relaxed">{hadith.source_note}</p>
                            </section>
                        )}
                    </div>

                    {/* Sidebar - All attributes */}
                    <aside className="space-y-6">
                        {/* হাদিস তথ্য */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-5">হাদিস তথ্য</h2>
                            <div className="space-y-4 text-sm">
                                <InfoRow label="শিরোনাম" value={hadith.title} />
                                <InfoRow label="স্লাগ" value={hadith.slug} />
                                <InfoRow label="হাদিস নম্বর" value={hadith.hadith_number} />
                                <InfoRow label="রেফারেন্স" value={hadith.reference} />
                                <InfoRow label="সংকলন" value={hadith.collection_name} />
                                <InfoRow label="কিতাব" value={hadith.kitab_name} />
                                <InfoRow label="পরিচ্ছেদ" value={hadith.chapter_name} />
                                <InfoRow label="রাবী" value={hadith.narrator_name} />
                                <InfoRow label="মান/গ্রেড" value={hadith.grade_display} badge="green" />
                            </div>
                        </div>

                        {/* বিষয় */}
                        {hadith.taxonomy_names.length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaTag className="w-4 h-4 text-primary-500" /> বিষয়
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {hadith.taxonomy_names.map((name, i) => (
                                        <span key={i} className="bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-full text-xs font-bold">{name}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* কীওয়ার্ড */}
                        {hadith.keywords && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaHashtag className="w-4 h-4 text-gray-400" /> কীওয়ার্ড
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {hadith.keywords.split(",").map((kw, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs">{kw.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* প্রকাশনা তথ্য */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">প্রকাশনা তথ্য</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">প্রকাশিত</span>
                                    <span className={hadith.is_published ? "text-green-600 font-medium" : "text-red-500"}>{hadith.is_published ? "হ্যাঁ" : "না"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ফিচার্ড</span>
                                    <span className={hadith.is_featured ? "text-green-600 font-medium" : "text-gray-400"}>{hadith.is_featured ? "হ্যাঁ" : "না"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">হোমপেজে দেখান</span>
                                    <span className={hadith.show_on_homepage ? "text-green-600 font-medium" : "text-gray-400"}>{hadith.show_on_homepage ? "হ্যাঁ" : "না"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ভিউ সংখ্যা</span>
                                    <span className="text-gray-700 font-medium flex items-center gap-1"><FaEye className="w-3 h-3" />{hadith.view_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created at</span>
                                    <span className="text-gray-700 text-xs">{new Date(hadith.created_at).toLocaleString("bn-BD")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Updated at</span>
                                    <span className="text-gray-700 text-xs">{new Date(hadith.updated_at).toLocaleString("bn-BD")}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
    if (!value) return null;
    return (
        <div className="flex gap-3">
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                {badge ? (
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${badge === "green" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>{value}</span>
                ) : (
                    <p className="font-semibold text-gray-800">{value}</p>
                )}
            </div>
        </div>
    );
}
