"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import EventCountdown from "@/components/events/EventCountdown";
import { API_URL } from "@/lib/api";
import { EVENT_CATEGORIES, EventListItem, eventStatusLabel, formatDateBn, formatTime, mediaUrl } from "@/lib/events";

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export default function EventsArchivePage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const url = category ? `${API_URL}/events/list/?category=${category}` : `${API_URL}/events/list/`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as EventListItem[] | ApiList<EventListItem>;
          setEvents(listFromResponse(data).sort((a, b) => b.id - a.id));
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero title="ইভেন্ট ও মাহফিল" subtitle="শাহপুর দরবার শরীফের আসন্ন ও সম্পন্ন অনুষ্ঠানসমূহ" showBismillah={false} />
      <Breadcrumbs items={[{ label: "ইভেন্ট ও মাহফিল" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">অনুষ্ঠান আর্কাইভ</h2>
            <p className="text-xs text-gray-400 mt-1">ক্যাটাগরি অনুযায়ী মাহফিল ও ইভেন্ট দেখুন</p>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল ক্যাটাগরি</option>
            {EVENT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <FaSpinner className="w-8 h-8 text-primary-500 mx-auto animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">কোনো ইভেন্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group relative bg-white rounded-[28px] border border-primary-100/80 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-950/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="absolute inset-2 rounded-[22px] border border-amber-100/80 pointer-events-none z-10"></div>
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-amber-300 to-primary-600 z-20"></div>
                <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100/50 overflow-hidden">
                  {event.poster ? (
                    <Image src={mediaUrl(event.poster)} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCalendarAlt className="w-14 h-14 text-primary-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/45 via-transparent to-primary-950/10"></div>
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                    <span className="bg-white/95 text-primary-750 border border-primary-100 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                      {event.category_display}
                    </span>
                    <span className="bg-primary-600 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm">
                      {eventStatusLabel(event.status)}
                    </span>
                  </div>
                </div>
                <div className="relative p-5 flex-1 flex flex-col">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary-50 -translate-y-8 translate-x-8"></div>
                  <div className="relative">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-600 mb-2">দাওয়াতনামা</p>
                    <h3 className="font-extrabold text-gray-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">{event.title}</h3>
                    {event.short_description && <p className="text-sm text-gray-500 line-clamp-2">{event.short_description}</p>}
                  </div>
                  <EventCountdown startDate={event.start_date} startTime={event.start_time} status={event.status} compact />
                  <div className="space-y-2 text-xs text-gray-600 mt-auto bg-gray-50/90 border border-gray-100 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0"><FaCalendarAlt className="w-3 h-3" /></span>
                      <span>{formatDateBn(event.start_date)}{event.end_date ? ` - ${formatDateBn(event.end_date)}` : ""}</span>
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0"><FaClock className="w-3 h-3" /></span>
                        <span>{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</span>
                      </div>
                    )}
                    {(event.venue_name || event.district_name) && (
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0"><FaMapMarkerAlt className="w-3 h-3" /></span>
                        <span>{event.venue_name || event.district_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-dashed border-amber-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-primary-700">বিস্তারিত দেখুন</span>
                    <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
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
