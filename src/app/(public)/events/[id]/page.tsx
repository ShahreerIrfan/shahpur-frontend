"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaExternalLinkAlt, FaMapMarkerAlt, FaSpinner, FaUserTie } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/lib/api";
import { EventDetail, eventStatusLabel, formatDateBn, formatTime, mediaUrl } from "@/lib/events";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/events/list/${id}/`);
        if (res.ok) {
          setEvent((await res.json()) as EventDetail);
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

  if (!event) {
    return <div className="min-h-screen text-center py-20 text-gray-500">ইভেন্ট পাওয়া যায়নি</div>;
  }

  const allPhotos = event.photos || [];

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50/60 border-b border-primary-100 py-14 md:py-20">
        <div className="absolute inset-0 islamic-pattern opacity-90 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <Link href="/events" className="inline-flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-6 bg-white/85 hover:bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
            <FaArrowLeft className="w-2.5 h-2.5" /> সকল ইভেন্ট
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">{event.category_display}</span>
                <span className="bg-white text-primary-700 border border-primary-100 px-3 py-1 rounded-full text-xs font-bold">{eventStatusLabel(event.status)}</span>
                {event.hijri_date && <span className="bg-gold-light/80 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{event.hijri_date}</span>}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary-950 leading-tight mb-5">{event.title}</h1>
              {event.short_description && <p className="text-primary-900/80 text-base md:text-lg leading-relaxed max-w-3xl">{event.short_description}</p>}
              <div className="flex flex-wrap gap-3 mt-6 text-xs md:text-sm text-primary-900">
                <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
                  <FaCalendarAlt className="text-primary-600" /> {formatDateBn(event.start_date)}{event.end_date ? ` - ${formatDateBn(event.end_date)}` : ""}
                </span>
                {event.start_time && (
                  <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
                    <FaClock className="text-primary-600" /> {formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                  </span>
                )}
                {(event.venue_name || event.district_name) && (
                  <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
                    <FaMapMarkerAlt className="text-primary-600" /> {event.venue_name || event.district_name}
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden bg-primary-100 shadow-xl border border-primary-100">
              {event.poster ? (
                <Image src={mediaUrl(event.poster)} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 800px" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaCalendarAlt className="w-20 h-20 text-primary-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "ইভেন্ট ও মাহফিল", url: "/events" }, { label: event.title }]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 mt-8">
          <div className="space-y-8">
            {event.description && (
              <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                  ইভেন্টের বিস্তারিত
                </h2>
                <p className="text-gray-650 leading-loose whitespace-pre-line text-justify">{event.description}</p>
              </section>
            )}

            {event.schedule.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                  অনুষ্ঠান সূচি
                </h2>
                <div className="space-y-4">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-20 shrink-0 text-xs font-bold text-primary-700 bg-primary-50 rounded-xl flex items-center justify-center px-2 text-center">
                        {item.time || "সময়"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{item.title}</h3>
                        {item.speaker && <p className="text-xs text-primary-600 font-semibold mt-1">{item.speaker}</p>}
                        {item.description && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {allPhotos.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                  ফটো গ্যালারি
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                      <Image src={mediaUrl(photo.image)} alt={photo.caption || event.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5">ইভেন্ট তথ্য</h2>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <FaCalendarAlt className="w-4 h-4 text-primary-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400">তারিখ</p>
                    <p className="font-semibold text-gray-800">{formatDateBn(event.start_date)}</p>
                  </div>
                </div>
                {event.start_time && (
                  <div className="flex gap-3">
                    <FaClock className="w-4 h-4 text-primary-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">সময়</p>
                      <p className="font-semibold text-gray-800">{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</p>
                    </div>
                  </div>
                )}
                {(event.full_address || event.venue_name) && (
                  <div className="flex gap-3">
                    <FaMapMarkerAlt className="w-4 h-4 text-primary-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">ঠিকানা</p>
                      <p className="font-semibold text-gray-800 leading-relaxed">{event.venue_name}</p>
                      {event.full_address && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{event.full_address}</p>}
                    </div>
                  </div>
                )}
                {event.google_map_link && (
                  <a href={event.google_map_link} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-primary-50 hover:bg-primary-100 text-primary-700 py-2.5 rounded-xl text-xs font-bold transition-colors">
                    গুগল ম্যাপে দেখুন <FaExternalLinkAlt className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {event.speakers.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5">বক্তা / মেহমান</h2>
                <div className="space-y-3">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                        <FaUserTie className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{speaker.name}</p>
                        {speaker.title && <p className="text-xs text-gray-500 mt-0.5">{speaker.title}</p>}
                        {speaker.topic && <p className="text-xs text-primary-600 mt-1 font-semibold">{speaker.topic}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(event.related_madrasha_name || event.related_khankah_name) && (
              <div className="bg-primary-50 rounded-3xl border border-primary-100 p-6">
                <h2 className="text-lg font-bold text-primary-900 mb-3">সম্পর্কিত প্রতিষ্ঠান</h2>
                {event.related_madrasha_name && <p className="text-sm text-primary-800 font-semibold">মাদ্রাসা: {event.related_madrasha_name}</p>}
                {event.related_khankah_name && <p className="text-sm text-primary-800 font-semibold mt-2">খানকাহ: {event.related_khankah_name}</p>}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
