"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBookOpen, FaMapMarkerAlt, FaUsers, FaSpinner, FaUserTie, FaCalendar } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { mediaUrl } from "@/lib/media";

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

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/madrasha/list/`)
            .then(res => res.json())
            .then(data => {
                const items = Array.isArray(data) ? data : data.results || [];
                setMadrashas([...items].sort((a, b) => b.id - a.id));
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <PageHero title="মাদ্রাসা সমূহ" subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত মাদ্রাসা সমূহ" showBismillah={false} />
            <Breadcrumbs items={[{ label: "মাদ্রাসা সমূহ" }]} />
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-16"><FaSpinner className="w-8 h-8 text-primary-500 mx-auto animate-spin" /></div>
                ) : madrashas.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <FaBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">অ্যাডমিন ড্যাশবোর্ড থেকে মাদ্রাসার তথ্য যোগ করলে এখানে প্রদর্শিত হবে।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
        </div>
    );
}
