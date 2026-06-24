"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaMapMarkerAlt, FaUsers, FaSpinner, FaUserTie, FaCalendar } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { mediaUrl } from "@/lib/media";
import Pagination from "@/components/ui/Pagination";

interface Madrasha {
    id: number;
    slug: string;
    madrasha_name: string;
    madrasha_description: string;
    featured_image: string | null;
    village: string;
    number_of_students: number;
    number_of_teachers: number;
    type_of_madrasha: string;
    year_of_establishment: string;
    district_name: string;
}

const TYPE_LABELS: Record<string, string> = { nurani: "নূরানী", hifz: "হিফজ", najera: "নাজেরা", academic: "একাডেমিক" };

export default function MadrashaListPage() {
    const [madrashas, setMadrashas] = useState<Madrasha[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const PAGE_SIZE = 10;

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/madrasha/list/?page=${page}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMadrashas(data);
                    setCount(data.length);
                } else {
                    setMadrashas(data.results || []);
                    setCount(data.count || 0);
                }
            })
            .finally(() => setLoading(false));
    }, [page]);

    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div>
            <PageHero title="মাদ্রাসা সমূহ" subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত মাদ্রাসা সমূহ" showBismillah={false} />
            <Breadcrumbs items={[{ label: "মাদ্রাসা সমূহ" }]} />
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="h-48 bg-gray-200 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
                                    <div className="flex gap-3">
                                        <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
                                        <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                                    <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
                                    <div className="flex justify-between pt-2">
                                        <div className="h-3 w-28 bg-gray-100 animate-pulse rounded" />
                                        <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : madrashas.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <FaBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">অ্যাডমিন ড্যাশবোর্ড থেকে মাদ্রাসার তথ্য যোগ করলে এখানে প্রদর্শিত হবে।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {madrashas.map((m) => (
                            <Link key={m.id} href={`/madrasha/${m.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="relative h-48 bg-gray-100">
                                    {m.featured_image ? (
                                        <Image src={mediaUrl(m.featured_image)} alt={m.madrasha_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                                            <FaBookOpen className="w-12 h-12 text-primary-200" />
                                        </div>
                                    )}
                                    {m.type_of_madrasha && (
                                        <span className="absolute top-3 left-3 text-[10px] font-medium bg-white/90 backdrop-blur-sm text-primary-700 px-2.5 py-1 rounded-full shadow-sm">
                                            {TYPE_LABELS[m.type_of_madrasha] || m.type_of_madrasha}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors leading-tight line-clamp-2">{m.madrasha_name}</h3>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                        {m.number_of_teachers > 0 && <span className="flex items-center gap-1"><FaUserTie className="w-3 h-3 text-primary-400" />{m.number_of_teachers} শিক্ষক</span>}
                                        {m.number_of_students > 0 && <span className="flex items-center gap-1"><FaUsers className="w-3 h-3 text-primary-400" />{m.number_of_students} শিক্ষার্থী</span>}
                                        {m.year_of_establishment && <span className="flex items-center gap-1"><FaCalendar className="w-3 h-3 text-primary-400" />{m.year_of_establishment} ঈস.</span>}
                                    </div>
                                    {m.madrasha_description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{m.madrasha_description}</p>}
                                    <div className="flex items-center justify-between">
                                        {m.village && <span className="text-xs text-gray-400 flex items-center gap-1"><FaMapMarkerAlt className="w-2.5 h-2.5" />{m.village}{m.district_name ? `, ${m.district_name}` : ""}</span>}
                                        <span className="text-xs font-medium text-primary-600 group-hover:underline">বিস্তারিত দেখুন →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 mt-8">
                        <p className="text-sm text-gray-500">মোট {count}টি মাদ্রাসা · পৃষ্ঠা {page} / {totalPages}</p>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
}
