"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendarAlt, FaEdit, FaEye, FaPlus, FaSearch, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { EventListItem, eventStatusLabel, formatDateBn } from "@/lib/events";
import Pagination from "@/components/ui/Pagination";

interface ApiList<T> {
  results?: T[];
  count?: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchEvents = useCallback(async (currentPage: number, currentSearch: string) => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      if (currentSearch.trim()) params.set("search", currentSearch.trim());

      const res = await authFetch(`/events/list/?${params.toString()}`);
      if (!res.ok) {
        throw new Error("ইভেন্ট তালিকা লোড করতে সমস্যা হয়েছে।");
      }
      const data = (await res.json()) as EventListItem[] | ApiList<EventListItem>;
      if (Array.isArray(data)) {
        setEvents(data);
        setCount(data.length);
      } else {
        setEvents(data.results || []);
        setCount(data.count || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      void fetchEvents(page, search);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [page, search, fetchEvents]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/events/list/${deleteId}/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setEvents((prev) => prev.filter((event) => event.id !== deleteId));
        setDeleteId(null);
        setCount((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error("ইভেন্ট মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ইভেন্ট মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const filteredEvents = events;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ইভেন্ট / মাহফিল পরিচালনা</h1>
          <p className="text-sm text-gray-500 mt-1">মাহফিল, ওরশ, মিলাদ ও অন্যান্য অনুষ্ঠানের তথ্য পরিচালনা করুন</p>
        </div>
        <Link href="/admin/events/create" className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto">
          <FaPlus className="w-3 h-3" />
          নতুন ইভেন্ট
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="ইভেন্ট বা ভেন্যু খুঁজুন..." />
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
          <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 text-sm">তথ্য লোড হচ্ছে...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FaCalendarAlt className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো ইভেন্ট যোগ করা হয়নি</h3>
          <p className="text-gray-500 text-sm mb-6">প্রথম মাহফিল বা ওরশের তথ্য যোগ করুন।</p>
          <Link href="/admin/events/create" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
            <FaPlus className="w-3 h-3" />
            ইভেন্ট যোগ করুন
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">SL</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ইভেন্ট</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্যাটাগরি</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">তারিখ</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">প্রকাশনা</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEvents.map((event, index) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.venue_name || "ভেন্যু দেয়া হয়নি"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded-lg">{event.category_display}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateBn(event.start_date)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{eventStatusLabel(event.status)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${event.is_published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {event.is_published ? "প্রকাশিত" : "ড্রাফট"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/events/${event.id}`} target="_blank" className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition-colors" title="প্রিভিউ">
                          <FaEye className="w-3 h-3" />
                        </Link>
                        <Link href={`/admin/events/edit/${event.id}`} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors" title="এডিট">
                          <FaEdit className="w-3 h-3" />
                        </Link>
                        <button onClick={() => setDeleteId(event.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              মোট {count}টি ইভেন্টের মধ্যে {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, count)}টি দেখানো হচ্ছে
            </p>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ইভেন্ট মুছে ফেলুন</h3>
            <p className="text-sm text-gray-500 mb-6">আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">বাতিল</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors">
                {deleting ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
