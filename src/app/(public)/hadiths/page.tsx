"use client";

import { useEffect, useState } from "react";
import SpaLink from "@/components/SpaLink";
import { FaBook, FaSearch, FaSpinner } from "react-icons/fa";
import { API_URL } from "@/lib/api";
import { HadithListItem } from "@/lib/hadiths";

export default function HadithsPage() {
    const [hadiths, setHadiths] = useState<HadithListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const url = search ? `${API_URL}/hadiths/list/?search=${encodeURIComponent(search)}` : `${API_URL}/hadiths/list/`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setHadiths(data.results || []);
                }
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [search]);

    return (
        <div className="min-h-screen bg-gray-50/40 pb-20">
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50/60 border-b border-primary-100 py-14 md:py-20">
                <div className="absolute inset-0 islamic-pattern opacity-90 pointer-events-none"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-primary-950 mb-4">হাদিস সংকলন</h1>
                    <p className="text-primary-900/70 text-base md:text-lg max-w-2xl mx-auto">সহীহ হাদিস সমূহের বাংলা অনুবাদ ও ব্যাখ্যা</p>
                    <div className="mt-8 max-w-lg mx-auto relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="হাদিস খুঁজুন..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-primary-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        />
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-10">
                {loading ? (
                    <div className="flex justify-center py-20"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>
                ) : hadiths.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">কোনো হাদিস পাওয়া যায়নি</div>
                ) : (
                    <div className="grid gap-4">
                        {hadiths.map((h) => (
                            <SpaLink key={h.id} href={`/hadiths/${h.id}`} className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-primary-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">#{h.hadith_number}</span>
                                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{h.grade_display}</span>
                                            {h.taxonomy_names.map((t, i) => <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{t}</span>)}
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-800 mb-2">{h.title}</h2>
                                        <p className="text-sm text-gray-600 line-clamp-2">{h.bangla_translation}</p>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                                            {h.collection_name && <span>{h.collection_name}</span>}
                                            {h.narrator_name && <span>• {h.narrator_name}</span>}
                                        </div>
                                    </div>
                                    <FaBook className="w-8 h-8 text-primary-200 shrink-0" />
                                </div>
                            </SpaLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
