import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaArrowRight, FaBookOpen, FaCalendarAlt, FaMapMarkerAlt, FaMosque } from "react-icons/fa";
import EventCountdown from "@/components/events/EventCountdown";
import { API_URL } from "@/lib/api";
import { eventCategoryLabel, formatDateBn } from "@/lib/events";
import { mediaUrl } from "@/lib/media";

type ApiList<T> = T[] | { results?: T[] };

interface MadrashaItem {
  id: number;
  madrasha_name: string;
  madrasha_description: string;
  featured_image: string | null;
  village: string;
  district_name: string;
  number_of_students: number;
  number_of_teachers: number;
}

interface KhankahItem {
  id: number;
  khankah_name: string;
  khankah_description: string;
  featured_image: string | null;
  village: string;
  district_name: string;
  director_name: string;
}

interface EventItem {
  id: number;
  title: string;
  category: string;
  category_display?: string;
  short_description: string;
  poster: string | null;
  start_date: string;
  start_time: string | null;
  status: string;
  venue_name: string;
  district_name: string;
}

function listFromResponse<T>(data: ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

async function getHomepageItems<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}?homepage=true`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiList<T>;
    return listFromResponse(data).slice(0, 4);
  } catch {
    return [];
  }
}

function CardImage({
  src,
  alt,
  icon,
}: {
  src: string | null;
  alt: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative h-44 bg-primary-50 overflow-hidden">
      {src ? (
        <Image src={mediaUrl(src)} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
      ) : (
        <div className="h-full flex items-center justify-center text-primary-300">{icon}</div>
      )}
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  href,
  buttonLabel,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  buttonLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-14 last:mb-0">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>
        <Link href={href} className="hidden md:inline-flex items-center gap-2 text-primary-700 font-bold text-sm hover:gap-3 transition-all">
          {buttonLabel} <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
      <div className="text-center mt-7 md:hidden">
        <Link href={href} className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors">
          {buttonLabel} <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default async function HomeFeaturedContent() {
  const [madrashas, khankahs, events] = await Promise.all([
    getHomepageItems<MadrashaItem>("/madrasha/list/"),
    getHomepageItems<KhankahItem>("/khankah/list/"),
    getHomepageItems<EventItem>("/events/list/"),
  ]);

  if (!madrashas.length && !khankahs.length && !events.length) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4">
        {madrashas.length > 0 && (
          <SectionShell title="আমাদের মাদ্রাসা সমূহ" subtitle="শাহপুর দরবার শরীফের তত্ত্বাবধানে পরিচালিত মাদ্রাসা" href="/madrasha" buttonLabel="সব মাদ্রাসা দেখুন">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {madrashas.map((item) => (
                <Link key={item.id} href={`/madrasha/${item.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <CardImage src={item.featured_image} alt={item.madrasha_name} icon={<FaBookOpen className="w-12 h-12" />} />
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-800 group-hover:text-primary-700 line-clamp-2">{item.madrasha_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-3">{item.madrasha_description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-4">
                      <span>{item.number_of_teachers} শিক্ষক</span>
                      <span>{item.number_of_students} শিক্ষার্থী</span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-4">
                      <FaMapMarkerAlt className="w-3 h-3 text-primary-400" />
                      {item.village || "শাহপুর"}{item.district_name ? `, ${item.district_name}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </SectionShell>
        )}

        {khankahs.length > 0 && (
          <SectionShell title="খানকাহ শরীফ সমূহ" subtitle="আধ্যাত্মিক সাধনা ও তরিকার সেবায় প্রতিষ্ঠিত খানকাহ শরীফ" href="/khankah" buttonLabel="সব খানকাহ দেখুন">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {khankahs.map((item) => (
                <Link key={item.id} href={`/khankah/${item.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <CardImage src={item.featured_image} alt={item.khankah_name} icon={<FaMosque className="w-12 h-12" />} />
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-800 group-hover:text-primary-700 line-clamp-2">{item.khankah_name}</h3>
                    {item.director_name && <p className="text-xs text-primary-700 font-bold mt-3">পরিচালক: {item.director_name}</p>}
                    <p className="text-sm text-gray-500 line-clamp-2 mt-3">{item.khankah_description}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-4">
                      <FaMapMarkerAlt className="w-3 h-3 text-primary-400" />
                      {item.village || "শাহপুর"}{item.district_name ? `, ${item.district_name}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </SectionShell>
        )}

        {events.length > 0 && (
          <SectionShell title="আসন্ন মাহফিল ও ইভেন্ট" subtitle="দরবার শরীফের গুরুত্বপূর্ণ মাহফিল, দোয়া ও অনুষ্ঠানসমূহ" href="/events" buttonLabel="সব ইভেন্ট দেখুন">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {events.map((item) => (
                <Link key={item.id} href={`/events/${item.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <CardImage src={item.poster} alt={item.title} icon={<FaCalendarAlt className="w-12 h-12" />} />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-primary-700 mb-3">
                      <span className="bg-primary-50 border border-primary-100 rounded-full px-2.5 py-1">{item.category_display || eventCategoryLabel(item.category)}</span>
                      {item.start_date && <span>{formatDateBn(item.start_date)}</span>}
                    </div>
                    <h3 className="font-extrabold text-gray-800 group-hover:text-primary-700 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-3">{item.short_description}</p>
                    <EventCountdown startDate={item.start_date} startTime={item.start_time} status={item.status} compact />
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-4">
                      <FaMapMarkerAlt className="w-3 h-3 text-primary-400" />
                      {item.venue_name || item.district_name || "শাহপুর দরবার শরীফ"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </SectionShell>
        )}
      </div>
    </section>
  );
}
