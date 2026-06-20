"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaMosque, FaMapMarkerAlt, FaSpinner, FaUserTie, FaArrowRight } from "react-icons/fa";
import PageHero from "@/components/ui/PageHero";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

interface Khankah {
    id: number;
    slug: string;
    khankah_name: string;
    khankah_description: string;
    featured_image: string | null;
    village: string;
    ward: string;
    union: string;
    district_name: string;
    upazila_name: string;
    director_name: string;
}

export default function KhankahListPage() {
    const [khankahs, setKhankahs] = useState<Khankah[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/khankah/list/`)
            .then(res => res.json())
            .then(data => {
                const items = Array.isArray(data) ? data : data.results || [];
                setKhankahs([...items].sort((a, b) => b.id - a.id));
            })
            .finally(() => setLoading(false));
    }, []);

    const getImageUrl = (path: string | null) => {
        if (!path) return "";
        let url = path;
        const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = baseApi.replace("/api", "");
        
        if (url.includes("localhost:8000")) {
            url = url.replace("http://localhost:8000", baseUrl);
        }
        if (!url.startsWith("http")) {
            url = `${baseUrl}${url}`;
        }
        return url;
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            <PageHero title="খানকাহ শরীফ সমূহ" subtitle="শাহপুর দরবার শরীফ কর্তৃক প্রতিষ্ঠিত খানকাহ শরীফ সমূহ" showBismillah={false} />
            <Breadcrumbs items={[{ label: "খানকাহ শরীফ সমূহ" }]} />
            
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-20">
                        <FaSpinner className="w-8 h-8 text-primary-500 mx-auto animate-spin" />
                    </div>
                ) : khankahs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <FaMosque className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">কোনো খানকাহ পাওয়া যায়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {khankahs.map((k) => (
                            <Link key={k.id} href={`/khankah/${k.id}`} className="group bg-white rounded-2xl border border-gray-150 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                                <div>
                                    {/* Primary Image Area */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {k.featured_image ? (
                                            <Image 
                                                src={getImageUrl(k.featured_image)} 
                                                alt={k.khankah_name} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                                unoptimized 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/40">
                                                <FaMosque className="w-12 h-12 text-primary-300 group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        )}
                                        {k.upazila_name && (
                                            <span className="absolute top-3 left-3 text-[10px] font-extrabold bg-white/95 backdrop-blur-sm text-primary-750 px-2.5 py-1 rounded-lg shadow-sm border border-primary-100/30">
                                                {k.upazila_name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <h3 className="font-extrabold text-gray-800 mb-2.5 group-hover:text-primary-750 transition-colors leading-snug text-base line-clamp-2">
                                            {k.khankah_name}
                                        </h3>
                                        
                                        {k.director_name && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-55 px-2.5 py-1.5 rounded-lg border border-gray-100 inline-flex">
                                                <FaUserTie className="w-3 h-3 text-primary-500" />
                                                <span>পরিচালক: <strong className="text-gray-750 font-bold">{k.director_name}</strong></span>
                                            </div>
                                        )}

                                        {k.khankah_description && (
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                                {k.khankah_description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 pb-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                                    <span className="text-gray-400 flex items-center gap-1 max-w-[70%] truncate">
                                        <FaMapMarkerAlt className="w-3 h-3 text-primary-400 shrink-0" />
                                        {k.village || "শাহপুর"}{k.district_name ? `, ${k.district_name}` : ""}
                                    </span>
                                    <span className="text-xs font-bold text-primary-600 group-hover:text-primary-700 transition-colors flex items-center gap-0.5 shrink-0">
                                        বিস্তারিত <FaArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
