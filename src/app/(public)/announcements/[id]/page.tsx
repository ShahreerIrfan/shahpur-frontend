"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface AnnouncementDetail {
  id: number;
  title: string;
  category: string;
  category_display: string;
  short_description: string;
  description: string;
  image: string | null;
  status: string;
  status_display: string;
  publisher: string;
  publisher_display: string;
  created_at: string;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/core/notifications/${id}/`);
        if (res.ok) {
          setAnnouncement((await res.json()) as AnnouncementDetail);
        }
      } catch (err) {
        console.error("Failed to load announcement:", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen text-center py-24 text-gray-500 bg-gray-50/30 font-medium">
        ঘোষণা বা নোটিশটি পাওয়া যায়নি
      </div>
    );
  }

  // Format Date in Bengali format
  const formatDateBn = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("bn-BD", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "notice":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "announcement":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 pb-24">
      {/* Decorative Top Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 border-b border-primary-950 py-16 md:py-24 text-white">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider mb-8 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/10">
            <FaArrowLeft className="w-2.5 h-2.5" /> হোমপেজে ফিরে যান
          </Link>
          
          <div className="flex justify-center gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(announcement.category)}`}>
              {announcement.category_display}
            </span>
            <span className="bg-white/15 text-white border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold">
              প্রকাশক: {announcement.publisher_display}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto drop-shadow-sm">
            {announcement.title}
          </h1>

          <div className="inline-flex items-center gap-2 text-white/70 text-xs md:text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <FaCalendarAlt className="text-gold-light" /> {formatDateBn(announcement.created_at)}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "ঘোষণা ও নোটিশ" }, { label: announcement.title }]} />

        <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Announcement Poster/Banner Image */}
          {announcement.image && (
            <div className="relative w-full h-[280px] md:h-[450px] bg-primary-950/5 border-b border-gray-100">
              <Image 
                src={mediaUrl(announcement.image)} 
                alt={announcement.title} 
                fill 
                className="object-cover" 
                sizes="(max-width: 1024px) 100vw, 800px" 
                priority 
              />
            </div>
          )}

          <div className="p-6 md:p-10 space-y-8">
            {/* Short Description Section */}
            {announcement.short_description && (
              <div className="relative p-6 bg-gradient-to-r from-primary-50 to-primary-50/30 rounded-2xl border border-primary-100">
                <span className="absolute top-3 right-4 text-xs font-bold text-primary-800 uppercase tracking-widest opacity-60">সারসংক্ষেপ</span>
                <p className="text-primary-900 text-sm md:text-base leading-relaxed font-semibold pr-12">
                  {announcement.short_description}
                </p>
              </div>
            )}

            {/* Detailed Description */}
            <article className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed font-medium">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                বিস্তারিত ঘোষণা
              </h3>
              <p className="whitespace-pre-line text-sm md:text-base text-gray-600 leading-relaxed">
                {announcement.description}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
