"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSpinner, FaMapMarkerAlt, FaUsers, FaUserTie, FaPhone, FaCalendar, FaArrowLeft, FaUserEdit, FaAward, FaCoins, FaGraduationCap, FaComments, FaLaptopCode, FaMapMarkedAlt, FaTree, FaBuilding, FaEnvelope } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { mediaUrl } from "@/lib/media";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const img = mediaUrl;

const TYPE_MAP: Record<string, string> = { nurani: "নূরানী", hifz: "হিফজ", najera: "নাজেরা", academic: "একাডেমিক" };
const MEDIUM_MAP: Record<string, string> = { bangla: "বাংলা", english: "ইংরেজি" };

export default function MadrashaDetail() {
    const { id } = useParams();
    const [data, setData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    // Lightbox states
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<{ url: string; caption: string }[]>([]);
    const [slideshowActive, setSlideshowActive] = useState(false);

    useEffect(() => {
        fetch(`${API}/madrasha/list/${id}/`)
            .then(r => r.ok ? r.json() : null)
            .then(d => setData(d))
            .finally(() => setLoading(false));
    }, [id]);

    // Keyboard navigation for Lightbox
    useEffect(() => {
        if (!lightboxOpen || lightboxImages.length === 0) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setLightboxOpen(false);
                setSlideshowActive(false);
            }
            if (e.key === "ArrowLeft") {
                setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
            }
            if (e.key === "ArrowRight") {
                setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, lightboxImages]);

    // Slideshow autoplay logic
    useEffect(() => {
        if (!slideshowActive || !lightboxOpen || lightboxImages.length <= 1) return;
        const interval = setInterval(() => {
            setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [slideshowActive, lightboxOpen, lightboxImages]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>;
    if (!data) return <div className="text-center py-20 min-h-screen"><p className="text-gray-500 text-lg">মাদ্রাসা পাওয়া যায়নি</p></div>;

    const teachers = (data.teachers as Record<string, any>[]) || [];
    const photos = (data.photos as Record<string, any>[]) || [];
    const v = (f: string) => (data[f] as string) || "";

    const COMMITTEE_ITEMS = [
        { label: "সভাপতি", key: "president", icon: <FaUserTie className="w-4 h-4" /> },
        { label: "সেক্রেটারি", key: "secretary", icon: <FaUserEdit className="w-4 h-4" /> },
        { label: "সহ-সভাপতি", key: "vice_president", icon: <FaAward className="w-4 h-4" /> },
        { label: "কেশিয়ার", key: "treasurer", icon: <FaCoins className="w-4 h-4" /> },
        { label: "পাঠ্যক্রম পরিচালক", key: "curriculum_director", icon: <FaGraduationCap className="w-4 h-4" /> },
        { label: "যোগাযোগ কর্মকর্তা", key: "public_relations_officer", icon: <FaComments className="w-4 h-4" /> },
        { label: "আইটি পরিচালক", key: "technology_it_director", icon: <FaLaptopCode className="w-4 h-4" /> }
    ];

    const ADDRESS_ITEMS = [
        { label: "গ্রাম", key: "village", icon: <FaTree className="w-4 h-4" /> },
        { label: "ইউনিয়ন", key: "union_parishad", icon: <FaBuilding className="w-4 h-4" /> },
        { label: "পোস্ট অফিস", key: "post_office", icon: <FaEnvelope className="w-4 h-4" /> },
        { label: "থানা/উপজেলা", key: "upazila_name", icon: <FaMapMarkerAlt className="w-4 h-4" /> },
        { label: "জেলা", key: "district_name", icon: <FaMapMarkedAlt className="w-4 h-4" /> },
        { label: "মাদ্রাসার ধরণ", key: "type_of_madrasha", icon: <FaBuilding className="w-4 h-4" /> },
        { label: "শিক্ষার মাধ্যম", key: "medium_of_instruction", icon: <FaGraduationCap className="w-4 h-4" /> }
    ];

    // Collect all gallery images for the lightbox (featured image goes first)
    const allImages: { url: string; caption: string }[] = [];
    if (data.featured_image) {
        allImages.push({
            url: img(data.featured_image as string),
            caption: "প্রধান ছবি"
        });
    }
    photos.forEach((p, idx) => {
        if (p.image) {
            allImages.push({
                url: img(p.image),
                caption: p.caption || `গ্যালারি ছবি ${idx + 1}`
            });
        }
    });


    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Banner - Enhanced Islamic Design */}
            <section className="madrasha-hero-gradient border-b border-primary-200/40 py-14 md:py-20 relative overflow-hidden">
                {/* Islamic geometric pattern overlay */}
                <div className="absolute inset-0 islamic-pattern-hero opacity-100 pointer-events-none"></div>
                
                {/* Decorative corner ornaments */}
                <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L50 0L50 10L10 10L10 50L0 50Z" stroke="#01B178" strokeWidth="1" fill="#01B178" fillOpacity="0.05"/>
                    <path d="M0 0L40 40" stroke="#01B178" strokeWidth="0.5" strokeDasharray="4 4"/>
                    <circle cx="25" cy="25" r="15" stroke="#01B178" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-20 pointer-events-none rotate-90">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L50 0L50 10L10 10L10 50L0 50Z" stroke="#01B178" strokeWidth="1" fill="#01B178" fillOpacity="0.05"/>
                    <path d="M0 0L40 40" stroke="#01B178" strokeWidth="0.5" strokeDasharray="4 4"/>
                    <circle cx="25" cy="25" r="15" stroke="#01B178" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-20 pointer-events-none -rotate-90">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L50 0L50 10L10 10L10 50L0 50Z" stroke="#01B178" strokeWidth="1" fill="#01B178" fillOpacity="0.05"/>
                    <path d="M0 0L40 40" stroke="#01B178" strokeWidth="0.5" strokeDasharray="4 4"/>
                    <circle cx="25" cy="25" r="15" stroke="#01B178" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-20 pointer-events-none rotate-180">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L50 0L50 10L10 10L10 50L0 50Z" stroke="#01B178" strokeWidth="1" fill="#01B178" fillOpacity="0.05"/>
                    <path d="M0 0L40 40" stroke="#01B178" strokeWidth="0.5" strokeDasharray="4 4"/>
                    <circle cx="25" cy="25" r="15" stroke="#01B178" strokeWidth="0.5"/>
                  </svg>
                </div>

                {/* Floating decorative circles */}
                <div className="absolute top-6 right-[15%] w-20 h-20 border border-primary-200/30 rounded-full animate-float pointer-events-none"></div>
                <div className="absolute bottom-8 left-[10%] w-14 h-14 border border-primary-200/20 rounded-full animate-float pointer-events-none" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-[30%] right-[5%] w-8 h-8 bg-primary-100/20 rounded-full animate-float pointer-events-none" style={{animationDelay: '4s'}}></div>
                
                {/* Soft radial glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/15 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-100/10 rounded-full translate-y-48 -translate-x-24 blur-3xl pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Content */}
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <Link href="/madrasha" className="inline-flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-8 bg-white/80 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full transition-all border border-primary-100/60 shadow-sm hover:shadow-md group">
                        <FaArrowLeft className="w-2.5 h-2.5 group-hover:-translate-x-0.5 transition-transform" /> সকল মাদ্রাসা
                    </Link>
                    
                    {/* Bismillah */}
                    <p className="arabic-text text-primary-600/70 text-base md:text-lg mb-3">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                    
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5 text-primary-950">
                        {v("madrasha_name")}
                    </h1>
                    
                    {/* Decorative line under title */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[2px] w-12 hero-decorative-border rounded-full"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <div className="h-[2px] w-24 hero-decorative-border rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-primary-900/90">
                        {v("village") && (
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary-100/50 shadow-sm hover:shadow-md transition-all">
                                <FaMapMarkerAlt className="text-primary-600 w-3.5 h-3.5" />
                                {v("village")}
                                {v("union_parishad") ? `, ${v("union_parishad")}` : ""}
                            </span>
                        )}
                        {v("type_of_madrasha") && (
                            <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-primary-700 transition-all">
                                {TYPE_MAP[v("type_of_madrasha")] || v("type_of_madrasha")}
                            </span>
                        )}
                        {v("year_of_establishment") && (
                            <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-primary-100/50 shadow-sm hover:shadow-md transition-all">
                                <FaCalendar className="w-3.5 h-3.5 text-primary-600" />
                                প্রতিষ্ঠা: {v("year_of_establishment")}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Bottom decorative border */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] hero-decorative-border opacity-40"></div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <Breadcrumbs items={[{ label: "মাদ্রাসা", url: "/madrasha" }, { label: v("madrasha_name") }]} />
                
                {/* Image Gallery Grid */}
                {(Boolean(data.featured_image) || photos.length > 0) && (
                    <div className="mb-12">
                        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                            ছবি ও গ্যালারি
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Main Featured Image */}
                            {Boolean(data.featured_image) ? (
                                <div 
                                    onClick={() => { 
                                        setLightboxImages(allImages); 
                                        setLightboxIndex(0); 
                                        setLightboxOpen(true); 
                                    }}
                                    className={`${
                                        photos.length > 0 ? "md:col-span-2" : "md:col-span-3"
                                    } h-[280px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden cursor-pointer relative group border border-gray-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.005] bg-gray-100`}
                                >
                                    <img 
                                        src={img(data.featured_image as string)} 
                                        alt={v("madrasha_name")} 
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-black/60 text-white text-xs font-semibold px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 shadow-lg">
                                            <span>🔍 জুম করে দেখুন</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Gallery Thumbnails Column */}
                            {photos.length > 0 && (
                                <div className={`${Boolean(data.featured_image) ? "md:col-span-1" : "md:col-span-3"}`}>
                                    {/* 1 Thumbnail */}
                                    {photos.length === 1 && (
                                        <div 
                                            onClick={() => { 
                                                setLightboxImages(allImages); 
                                                setLightboxIndex(data.featured_image ? 1 : 0); 
                                                setLightboxOpen(true); 
                                            }}
                                            className="h-[280px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden cursor-pointer relative group border border-gray-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-gray-100"
                                        >
                                            <img src={img(photos[0].image)} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="bg-black/60 text-white text-xs font-semibold px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 shadow-lg">
                                                    <span>🔍 জুম করে দেখুন</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2 Thumbnails (Vertical Stack) */}
                                    {photos.length === 2 && (
                                        <div className="grid grid-cols-1 gap-3 h-full">
                                            {photos.slice(0, 2).map((p, i) => {
                                                const actualIndex = data.featured_image ? i + 1 : i;
                                                return (
                                                    <div 
                                                        key={i}
                                                        onClick={() => { 
                                                            setLightboxImages(allImages); 
                                                            setLightboxIndex(actualIndex); 
                                                            setLightboxOpen(true); 
                                                        }}
                                                        className="h-[134px] sm:h-[168px] md:h-[194px] rounded-2xl overflow-hidden cursor-pointer relative group border border-gray-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-gray-100"
                                                    >
                                                        <img src={img(p.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5 flex items-center gap-1.5 shadow-md">
                                                                <span>🔍 জুম</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 3 Thumbnails (Balanced: Row of 2 + 1 Full Width Span) */}
                                    {photos.length === 3 && (
                                        <div className="grid grid-cols-2 gap-3 h-full">
                                            {photos.slice(0, 3).map((p, i) => {
                                                const actualIndex = data.featured_image ? i + 1 : i;
                                                const isLast = i === 2;
                                                return (
                                                    <div 
                                                        key={i}
                                                        onClick={() => { 
                                                            setLightboxImages(allImages); 
                                                            setLightboxIndex(actualIndex); 
                                                            setLightboxOpen(true); 
                                                        }}
                                                        className={`${
                                                            isLast ? "col-span-2" : "col-span-1"
                                                        } h-[134px] sm:h-[168px] md:h-[194px] rounded-2xl overflow-hidden cursor-pointer relative group border border-gray-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-gray-100`}
                                                    >
                                                        <img src={img(p.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5 flex items-center gap-1.5 shadow-md">
                                                                <span>🔍 জুম</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 4+ Thumbnails (2x2 Grid, overlay on 4th if >4) */}
                                    {photos.length >= 4 && (
                                        <div className="grid grid-cols-2 gap-3 h-full">
                                            {photos.slice(0, 4).map((p, i) => {
                                                const isFourth = i === 3;
                                                const hasMore = photos.length > 4;
                                                const actualIndex = data.featured_image ? i + 1 : i;
                                                return (
                                                    <div 
                                                        key={i} 
                                                        onClick={() => { 
                                                            setLightboxImages(allImages); 
                                                            setLightboxIndex(actualIndex); 
                                                            setLightboxOpen(true); 
                                                        }}
                                                        className="h-[134px] sm:h-[168px] md:h-[194px] rounded-2xl overflow-hidden cursor-pointer relative group border border-gray-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] bg-gray-100"
                                                    >
                                                        <img src={img(p.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        {isFourth && hasMore ? (
                                                            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white font-bold text-sm">
                                                                <span className="text-xl">+{photos.length - 3}</span>
                                                                <span className="text-[10px] uppercase font-semibold text-primary-200 mt-1">আরও ছবি</span>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-350 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <div className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5 flex items-center gap-1.5 shadow-md">
                                                                    <span>🔍 জুম</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { count: data.number_of_students, label: "শিক্ষার্থী", icon: <FaUsers className="w-5 h-5" /> },
                        { count: data.number_of_teachers, label: "শিক্ষক", icon: <FaUserTie className="w-5 h-5" /> },
                        { count: v("year_of_establishment") || "—", label: "প্রতিষ্ঠার সন", icon: <FaCalendar className="w-5 h-5" /> },
                        { count: v("village") || "—", label: "গ্রাম", icon: <FaMapMarkerAlt className="w-5 h-5" /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center text-center md:text-left gap-3 md:gap-4 hover:shadow-md transition-shadow duration-200 w-full min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                                {stat.icon}
                            </div>
                            <div className="min-w-0 w-full">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-sm sm:text-base md:text-xl font-bold text-gray-800 mt-0.5 break-words">{stat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {v("madrasha_description") && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm mb-10">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                            মাদ্রাসার বর্ণনা
                        </h2>
                        <p className="text-gray-650 text-base leading-loose whitespace-pre-line text-justify">{v("madrasha_description")}</p>
                    </div>
                )}

                {v("founder_of_madrasha") && (
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 p-6 rounded-3xl border border-primary-100/50 mb-10 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm shrink-0 border border-primary-100">
                            <FaUserTie className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">প্রতিষ্ঠাতা</p>
                            <p className="text-base font-extrabold text-primary-800 mt-0.5">{v("founder_of_madrasha")}</p>
                        </div>
                    </div>
                )}

                {/* Committee & Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Committee Members Box */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                                কমিটি সদস্যবৃন্দ
                            </h2>
                            <div className="border-t border-gray-100">
                                {COMMITTEE_ITEMS.filter(item => v(item.key)).map(item => (
                                    <div key={item.key} className="flex items-center justify-between py-2 px-1 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/10">
                                                <span className="scale-[0.85] flex items-center justify-center">{item.icon}</span>
                                            </div>
                                            <span className="text-gray-500 font-normal text-xs md:text-sm">{item.label}</span>
                                        </div>
                                        <span className="font-extrabold text-gray-950 text-xs md:text-sm text-right pl-4 leading-relaxed">{v(item.key)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Address Box */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                                ঠিকানা ও সাধারণ তথ্য
                            </h2>
                            <div className="border-t border-gray-100">
                                {ADDRESS_ITEMS.filter(item => v(item.key)).map(item => (
                                    <div key={item.key} className="flex items-center justify-between py-2 px-1 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/10">
                                                <span className="scale-[0.85] flex items-center justify-center">{item.icon}</span>
                                            </div>
                                            <span className="text-gray-500 font-normal text-xs md:text-sm">{item.label}</span>
                                        </div>
                                        <span className="font-extrabold text-gray-950 text-xs md:text-sm text-right pl-4 leading-relaxed max-w-[65%] break-words">
                                            {item.key === "type_of_madrasha" 
                                                ? (TYPE_MAP[v(item.key)] || v(item.key)) 
                                                : item.key === "medium_of_instruction" 
                                                    ? (MEDIUM_MAP[v(item.key)] || v(item.key)) 
                                                    : v(item.key)
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Teachers Section */}
                {teachers.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                            শিক্ষকবৃন্দ ({teachers.length} জন)
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {teachers.map((t, i) => (
                                <div key={i} className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    <div>
                                        {/* Card Header Color Accent */}
                                        <div className="h-16 bg-gradient-to-br from-primary-50/50 to-primary-100/30 relative"></div>
                                        
                                        {/* Centered Circular Avatar */}
                                        <div 
                                            onClick={() => {
                                                if (t.teacher_image) {
                                                    const teacherImages = teachers
                                                        .filter(teach => teach.teacher_image)
                                                        .map(teach => ({
                                                            url: img(teach.teacher_image),
                                                            caption: `${teach.teacher_name} - ${teach.teacher_education_qualification || "শিক্ষক"}`
                                                        }));
                                                    const idxInTeacherList = teachers
                                                        .filter(teach => teach.teacher_image)
                                                        .findIndex(teach => teach.id === t.id);
                                                    setLightboxImages(teacherImages);
                                                    setLightboxIndex(idxInTeacherList >= 0 ? idxInTeacherList : 0);
                                                    setLightboxOpen(true);
                                                }
                                            }}
                                            className={`w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 relative z-10 bg-gray-50 flex items-center justify-center transition-all ${
                                                t.teacher_image ? "cursor-pointer hover:scale-105 hover:border-primary-100 hover:shadow-lg" : ""
                                            }`}
                                            title={t.teacher_image ? "ছবি বড় করে দেখুন" : ""}
                                        >
                                            {t.teacher_image ? (
                                                <img 
                                                    src={img(t.teacher_image)} 
                                                    alt={t.teacher_name} 
                                                    className="w-full h-full object-cover object-top" 
                                                />
                                            ) : (
                                                <FaUserTie className="w-10 h-10 text-primary-300" />
                                            )}
                                        </div>
                                        
                                        {/* Teacher Info */}
                                        <div className="p-5 text-center">
                                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">{t.teacher_name}</h4>
                                            <p className="text-xs font-semibold text-primary-600/85 mt-1 bg-primary-50 px-2.5 py-0.5 rounded-full inline-block">
                                                {t.teacher_education_qualification || "শিক্ষক"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button aligned at bottom */}
                                    <div className="px-5 pb-5 text-center pt-2">
                                        {t.teacher_phone_number ? (
                                            <a 
                                                href={`tel:${t.teacher_phone_number}`} 
                                                className="inline-flex items-center justify-center gap-1.5 text-xs text-primary-600 bg-primary-50 hover:bg-primary-600 hover:text-white font-bold w-full py-2.5 rounded-2xl transition-all duration-200 shadow-sm hover:shadow active:scale-98"
                                            >
                                                <FaPhone className="w-2.5 h-2.5" />
                                                {t.teacher_phone_number}
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 block py-2.5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                যোগাযোগের নম্বর নেই
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Lightbox Modal */}
            {lightboxOpen && lightboxImages.length > 0 && (
                <div 
                    onClick={() => {
                        setLightboxOpen(false);
                        setSlideshowActive(false);
                    }}
                    className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex flex-col justify-between select-none animate-fadeIn cursor-zoom-out"
                >
                    {/* Top Bar Controls */}
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-20 px-6 flex items-center justify-between text-white z-[10001] bg-gradient-to-b from-black/80 to-transparent"
                    >
                        <span className="text-sm font-semibold tracking-wide truncate max-w-[50%] bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                            {lightboxImages[lightboxIndex]?.caption || "ছবি"}
                        </span>
                        
                        <div className="flex items-center gap-3">
                            {/* Autoplay / Slideshow Button */}
                            {lightboxImages.length > 1 && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSlideshowActive(prev => !prev);
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                                        slideshowActive 
                                            ? "bg-primary-500 border-primary-400 text-white animate-pulse" 
                                            : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
                                    } cursor-pointer`}
                                    title={slideshowActive ? "স্লাইডশো বন্ধ করুন" : "স্লাইডশো চালু করুন"}
                                >
                                    {slideshowActive ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                            )}

                            {/* Fullscreen Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const elem = document.documentElement;
                                    if (!document.fullscreenElement) {
                                        elem.requestFullscreen().catch(err => console.log(err));
                                    } else {
                                        document.exitFullscreen();
                                    }
                                }}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                                title="ফুল স্ক্রিন"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                </svg>
                            </button>

                            {/* Close Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxOpen(false);
                                    setSlideshowActive(false);
                                }}
                                className="w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                                title="বন্ধ করুন"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Main Image View Area */}
                    <div className="flex-1 w-full flex items-center justify-center px-4 md:px-20 relative">
                        {/* Left arrow */}
                        {lightboxImages.length > 1 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(prev => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
                                }}
                                className="absolute left-6 w-12 h-12 bg-white/10 hover:bg-white/25 hover:scale-105 active:scale-95 text-white border border-white/20 rounded-full flex items-center justify-center transition-all z-[10000] cursor-pointer backdrop-blur-md shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Image Frame */}
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-[85%] max-h-[65vh] flex flex-col items-center justify-center"
                        >
                            <img 
                                src={lightboxImages[lightboxIndex]?.url} 
                                alt="" 
                                className="max-w-full max-h-[58vh] object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none border border-white/10"
                            />
                            <div className="text-white/80 text-xs font-semibold mt-4 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                ছবি {lightboxIndex + 1} / {lightboxImages.length}
                            </div>
                        </div>

                        {/* Right arrow */}
                        {lightboxImages.length > 1 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(prev => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-6 w-12 h-12 bg-white/10 hover:bg-white/25 hover:scale-105 active:scale-95 text-white border border-white/20 rounded-full flex items-center justify-center transition-all z-[10000] cursor-pointer backdrop-blur-md shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Bottom Thumbnail Strip */}
                    {lightboxImages.length > 1 && (
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-[80vw] mx-auto pb-8 z-[10001]"
                        >
                            <div className="flex gap-2.5 overflow-x-auto py-2 px-4 scrollbar-thin scrollbar-thumb-primary-500 max-w-full justify-start md:justify-center">
                                {lightboxImages.map((imgObj, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex(idx);
                                        }}
                                        className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                                            lightboxIndex === idx 
                                                ? "border-2 border-primary-500 scale-105 shadow-lg shadow-primary-500/30" 
                                                : "border border-white/10 opacity-40 hover:opacity-90"
                                        }`}
                                    >
                                        <img src={imgObj.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
