"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    FaSpinner, 
    FaMapMarkerAlt, 
    FaUserTie, 
    FaPhone, 
    FaArrowLeft, 
    FaAward, 
    FaCoins, 
    FaCrown, 
    FaUserEdit, 
    FaEnvelope, 
    FaBuilding, 
    FaTree, 
    FaMapMarkedAlt, 
    FaMosque 
} from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { mediaUrl } from "@/lib/media";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const img = mediaUrl;

export default function KhankahDetail() {
    const { id } = useParams();
    const [data, setData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    // Lightbox states
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<{ url: string; caption: string }[]>([]);
    const [slideshowActive, setSlideshowActive] = useState(false);

    useEffect(() => {
        fetch(`${API}/khankah/list/${id}/`)
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
    if (!data) return <div className="text-center py-20 min-h-screen"><p className="text-gray-500 text-lg">খানকাহ পাওয়া যায়নি</p></div>;

    const photos = (data.photos as Record<string, any>[]) || [];
    const v = (f: string) => (data[f] as string) || "";

    const COMMITTEE_ITEMS = [
        { label: "পরিচালক", key: "director_name", icon: <FaUserTie className="w-4 h-4" /> },
        { label: "পরিচালকের ফোন নাম্বার", key: "director_phone", icon: <FaPhone className="w-4 h-4" /> },
        { label: "সভাপতি", key: "president_name", icon: <FaCrown className="w-4 h-4" /> },
        { label: "সহ-সভাপতি", key: "vice_president_name", icon: <FaAward className="w-4 h-4" /> },
        { label: "সেক্রেটারি", key: "secretary_name", icon: <FaUserEdit className="w-4 h-4" /> },
        { label: "ক্যাশিয়ার", key: "cashier_name", icon: <FaCoins className="w-4 h-4" /> }
    ];

    const ADDRESS_ITEMS = [
        { label: "সম্পূর্ণ ঠিকানা", key: "full_address", icon: <FaMapMarkedAlt className="w-4 h-4" /> },
        { label: "গ্রাম", key: "village", icon: <FaTree className="w-4 h-4" /> },
        { label: "ওয়ার্ড", key: "ward", icon: <FaBuilding className="w-4 h-4" /> },
        { label: "ইউনিয়ন", key: "union", icon: <FaBuilding className="w-4 h-4" /> },
        { label: "উপজেলা", key: "upazila_name", icon: <FaMapMarkerAlt className="w-4 h-4" /> },
        { label: "জেলা", key: "district_name", icon: <FaMapMarkerAlt className="w-4 h-4" /> }
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
            {/* Hero Banner - Premium light-mint theme matching checkers pattern */}
            <section className="bg-gradient-to-br from-primary-50/60 via-white to-primary-50/40 border-t border-b border-primary-100/60 py-16 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 islamic-pattern opacity-[0.95] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary-100/10 rounded-full translate-y-40 blur-3xl"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <Link href="/khankah" className="inline-flex items-center gap-2 text-primary-900 text-xs font-semibold uppercase tracking-wider mb-6 bg-white hover:bg-primary-50/70 px-3.5 py-1.5 rounded-full transition-all border border-primary-100/60 shadow-sm">
                        <FaArrowLeft className="w-2.5 h-2.5" /> সকল খানকাহ
                    </Link>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-primary-950">{v("khankah_name")}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-primary-900/90">
                        {v("village") && (
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-primary-100/40 shadow-sm">
                                <FaMapMarkerAlt className="text-primary-600 w-3 h-3" />
                                {v("village")}
                                {v("union") ? `, ${v("union")}` : ""}
                            </span>
                        )}
                        {v("upazila_name") && (
                            <span className="bg-primary-600 text-white px-3 py-1 rounded-lg font-bold shadow-sm">
                                {v("upazila_name")}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <Breadcrumbs items={[{ label: "খানকাহ শরীফ সমূহ", url: "/khankah" }, { label: v("khankah_name") }]} />

                {/* Image Gallery Grid */}
                {(Boolean(data.featured_image) || photos.length > 0) && (
                    <div className="mb-12 mt-6">
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
                                        alt={v("khankah_name")} 
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

                                    {/* 3 Thumbnails */}
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

                                    {/* 4+ Thumbnails */}
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
                        { count: v("director_name") || "—", label: "পরিচালক", icon: <FaUserTie className="w-5 h-5" /> },
                        { count: v("president_name") || "—", label: "সভাপতি", icon: <FaCrown className="w-5 h-5" /> },
                        { count: v("director_phone") || "—", label: "যোগাযোগ নম্বর", icon: <FaPhone className="w-5 h-5" /> },
                        { count: v("village") || "—", label: "গ্রাম", icon: <FaMapMarkerAlt className="w-5 h-5" /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                                {stat.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-sm font-bold text-gray-800 mt-1 truncate" title={stat.count}>{stat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {v("khankah_description") && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm mb-10">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                            খানকার বর্ণনা
                        </h2>
                        <p className="text-gray-650 text-base leading-loose whitespace-pre-line text-justify">{v("khankah_description")}</p>
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
                                        <span className="font-extrabold text-gray-955 text-xs md:text-sm text-right pl-4 leading-relaxed">{v(item.key)}</span>
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
                                ঠিকানা
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
                                        <span className="font-extrabold text-gray-955 text-xs md:text-sm text-right pl-4 leading-relaxed max-w-[65%] break-words">{v(item.key)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
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
