"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaCalendarAlt, FaImage, FaImages, FaPlus, FaSave, FaSpinner, FaTrash, FaUsers } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import {
  District,
  EVENT_CATEGORIES,
  EVENT_FORM_STATUSES,
  EventDetail,
  EventPhoto,
  EventScheduleItem,
  EventSpeaker,
  RelatedKhankah,
  RelatedMadrasha,
  Upazila,
  mediaUrl,
} from "@/lib/events";
import ImageGalleryUpload from "@/components/admin/ImageGalleryUpload";

interface EventFormProps {
  eventId?: string;
}

interface ApiList<T> {
  results?: T[];
}

const emptySpeaker: EventSpeaker = { name: "", title: "", topic: "" };
const emptyScheduleItem: EventScheduleItem = { time: "", title: "", description: "", speaker: "" };

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export default function EventForm({ eventId }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [madrashas, setMadrashas] = useState<RelatedMadrasha[]>([]);
  const [khankahs, setKhankahs] = useState<RelatedKhankah[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([{ ...emptySpeaker }]);
  const [schedule, setSchedule] = useState<EventScheduleItem[]>([{ ...emptyScheduleItem }]);
  const [existingPhotos, setExistingPhotos] = useState<EventPhoto[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const fetchUpazilas = useCallback(async (districtId?: string) => {
    const url = districtId ? `${API_URL}/madrasha/upazilas/?district=${districtId}` : `${API_URL}/madrasha/upazilas/`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as Upazila[] | ApiList<Upazila>;
      setUpazilas(listFromResponse(data));
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    const [districtRes, madrashaRes, khankahRes] = await Promise.all([
      fetch(`${API_URL}/madrasha/districts/`),
      fetch(`${API_URL}/madrasha/list/`),
      fetch(`${API_URL}/khankah/list/`),
    ]);

    if (districtRes.ok) {
      const data = (await districtRes.json()) as District[] | ApiList<District>;
      setDistricts(listFromResponse(data));
    }
    if (madrashaRes.ok) {
      const data = (await madrashaRes.json()) as RelatedMadrasha[] | ApiList<RelatedMadrasha>;
      setMadrashas(listFromResponse(data));
    }
    if (khankahRes.ok) {
      const data = (await khankahRes.json()) as RelatedKhankah[] | ApiList<RelatedKhankah>;
      setKhankahs(listFromResponse(data));
    }
  }, []);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    const res = await authFetch(`/events/list/${eventId}/`);
    if (!res.ok) {
      throw new Error("ইভেন্ট লোড করতে সমস্যা হয়েছে।");
    }
    const data = (await res.json()) as EventDetail;
    setEvent(data);
    setSelectedDistrict(data.district ? String(data.district) : "");
    setSpeakers(data.speakers.length > 0 ? data.speakers : [{ ...emptySpeaker }]);
    setSchedule(data.schedule.length > 0 ? data.schedule : [{ ...emptyScheduleItem }]);
    setExistingPhotos(data.photos || []);
    if (data.poster) {
      setPosterPreview(mediaUrl(data.poster));
    }
    if (data.district) {
      await fetchUpazilas(String(data.district));
    }
  }, [eventId, fetchUpazilas]);

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        await fetchOptions();
        if (eventId) {
          await fetchEvent();
        } else {
          await fetchUpazilas();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [eventId, fetchEvent, fetchOptions, fetchUpazilas]);

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    void fetchUpazilas(districtId);
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateSpeaker = (index: number, field: keyof EventSpeaker, value: string) => {
    setSpeakers((prev) => prev.map((speaker, i) => (i === index ? { ...speaker, [field]: value } : speaker)));
  };

  const updateSchedule = (index: number, field: keyof EventScheduleItem, value: string) => {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleDeletedPhoto = (photoId: number) => {
    setDeletedPhotoIds((prev) => [...prev, photoId]);
    setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const token = localStorage.getItem("access_token");
    const element = (name: string) => form.elements.namedItem(name);
    const isChecked = (name: string) => {
      const item = element(name);
      return item instanceof HTMLInputElement && item.checked;
    };

    const cleanedSpeakers = speakers.filter((speaker) => speaker.name.trim());
    const cleanedSchedule = schedule.filter((item) => item.title.trim() || item.time.trim());
    data.set("speakers", JSON.stringify(cleanedSpeakers));
    data.set("schedule", JSON.stringify(cleanedSchedule));
    data.set("is_published", isChecked("is_published") ? "true" : "false");
    data.set("is_featured", isChecked("is_featured") ? "true" : "false");
    data.set("show_on_homepage", isChecked("show_on_homepage") ? "true" : "false");

    ["end_date", "start_time", "end_time", "district", "upazila", "related_madrasha", "related_khankah"].forEach((field) => {
      if (!data.get(field)) {
        data.delete(field);
      }
    });

    if (posterFile) {
      data.set("poster", posterFile);
    } else {
      data.delete("poster");
    }

    try {
      const res = await authFetch(isEdit ? `/events/list/${eventId}/` : "/events/list/", {
        method: isEdit ? "PATCH" : "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        const message = errorData
          ? Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join("; ")
          : "ইভেন্ট সংরক্ষণ করতে সমস্যা হয়েছে।";
        throw new Error(message);
      }

      const savedEvent = (await res.json()) as EventDetail;
      const savedId = isEdit ? eventId : String(savedEvent.id);

      if (savedId) {
        for (const photoId of deletedPhotoIds) {
          await fetch(`${API_URL}/events/photos/${photoId}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        for (const file of galleryFiles) {
          const photoForm = new FormData();
          photoForm.append("event", savedId);
          photoForm.append("image", file);
          await fetch(`${API_URL}/events/photos/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: photoForm,
          });
        }
      }

      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ইভেন্ট সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const value = (field: keyof EventDetail) => event?.[field] ?? "";
  const statusValue = event?.status === "cancelled" ? "cancelled" : "upcoming";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? "ইভেন্ট সম্পাদনা" : "নতুন ইভেন্ট/মাহফিল যোগ করুন"}</h1>
          <p className="text-xs text-gray-400 mt-0.5">মাহফিল, ওরশ, মিলাদ, জিকির ও অন্যান্য অনুষ্ঠানের তথ্য পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-500 w-4 h-4" />
                <h3 className="font-semibold text-gray-800 text-sm">ইভেন্টের তথ্য</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ইভেন্টের নাম *</label>
                  <input name="title" defaultValue={String(value("title"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none" placeholder="যেমন: বার্ষিক ওরশ শরীফ" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্যাটাগরি</label>
                    <select name="category" defaultValue={String(value("category") || "mahfil")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      {EVENT_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">স্ট্যাটাস</label>
                    <select name="status" defaultValue={statusValue} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      {EVENT_FORM_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1.5">আসন্ন, চলমান ও সম্পন্ন স্ট্যাটাস তারিখ/সময় অনুযায়ী নিজে নিজে নির্ধারিত হবে।</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">সংক্ষিপ্ত বর্ণনা</label>
                  <input name="short_description" defaultValue={String(value("short_description"))} maxLength={300} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="আর্কাইভ পেজে দেখানোর জন্য ছোট বর্ণনা" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বিস্তারিত বর্ণনা</label>
                  <textarea name="description" defaultValue={String(value("description"))} rows={5} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="ইভেন্টের বিস্তারিত লিখুন"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-800 text-sm">তারিখ ও ঠিকানা</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শুরুর তারিখ *</label>
                    <input name="start_date" type="date" defaultValue={String(value("start_date"))} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শেষ তারিখ</label>
                    <input name="end_date" type="date" defaultValue={String(value("end_date") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">হিজরি তারিখ</label>
                    <input name="hijri_date" defaultValue={String(value("hijri_date"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="যেমন: ১২ রবিউল আউয়াল" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শুরুর সময়</label>
                    <input name="start_time" type="time" defaultValue={String(value("start_time") || "").slice(0, 5)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">শেষ সময়</label>
                    <input name="end_time" type="time" defaultValue={String(value("end_time") || "").slice(0, 5)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ভেন্যু</label>
                  <input name="venue_name" defaultValue={String(value("venue_name"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="শাহপুর দরবার শরীফ" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">সম্পূর্ণ ঠিকানা</label>
                  <textarea name="full_address" defaultValue={String(value("full_address"))} rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">গুগল ম্যাপ লিংক</label>
                  <input name="google_map_link" defaultValue={String(value("google_map_link"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://maps.google.com/..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-purple-500 w-4 h-4" />
                  <h3 className="font-semibold text-gray-800 text-sm">বক্তা / মেহমান</h3>
                </div>
                <button type="button" onClick={() => setSpeakers((prev) => [...prev, { ...emptySpeaker }])} className="text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1">
                  <FaPlus className="w-2.5 h-2.5" /> যোগ করুন
                </button>
              </div>
              <div className="p-6 space-y-3">
                {speakers.map((speaker, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_36px] gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <input value={speaker.name} onChange={(e) => updateSpeaker(index, "name", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="নাম" />
                    <input value={speaker.title || ""} onChange={(e) => updateSpeaker(index, "title", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="পদবি/পরিচয়" />
                    <input value={speaker.topic || ""} onChange={(e) => updateSpeaker(index, "topic", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="বিষয়" />
                    <button type="button" onClick={() => setSpeakers((prev) => prev.filter((_, i) => i !== index))} className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-800 text-sm">অনুষ্ঠান সূচি</h3>
                </div>
                <button type="button" onClick={() => setSchedule((prev) => [...prev, { ...emptyScheduleItem }])} className="text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1">
                  <FaPlus className="w-2.5 h-2.5" /> যোগ করুন
                </button>
              </div>
              <div className="p-6 space-y-3">
                {schedule.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_36px] gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <input value={item.time} onChange={(e) => updateSchedule(index, "time", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="বাদ আসর" />
                    <input value={item.title} onChange={(e) => updateSchedule(index, "title", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="জিকির মাহফিল" />
                    <input value={item.speaker || ""} onChange={(e) => updateSchedule(index, "speaker", e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" placeholder="দায়িত্বপ্রাপ্ত/বক্তা" />
                    <button type="button" onClick={() => setSchedule((prev) => prev.filter((_, i) => i !== index))} className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                      <FaTrash className="w-3 h-3" />
                    </button>
                    <textarea value={item.description || ""} onChange={(e) => updateSchedule(index, "description", e.target.value)} className="md:col-span-4 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none resize-none" rows={2} placeholder="সংক্ষিপ্ত বিবরণ"></textarea>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">প্রকাশনা</h4>
              <div className="space-y-3 mb-4">
                <label className="flex items-center justify-between text-xs text-gray-600">
                  প্রকাশিত
                  <input name="is_published" type="checkbox" defaultChecked={event?.is_published ?? true} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  ফিচার্ড ইভেন্ট
                  <input name="is_featured" type="checkbox" defaultChecked={event?.is_featured ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  হোমপেজে দেখান
                  <input name="show_on_homepage" type="checkbox" defaultChecked={event?.show_on_homepage ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                <FaSave className="w-3.5 h-3.5" />
                {saving ? "সংরক্ষণ হচ্ছে..." : isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">জেলা</h4>
              <select name="district" value={selectedDistrict} onChange={(e) => handleDistrictChange(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="">জেলা নির্বাচন করুন</option>
                {districts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">থানা/উপজেলা</h4>
              <select name="upazila" defaultValue={event?.upazila ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="">উপজেলা নির্বাচন করুন</option>
                {upazilas.map((upazila) => <option key={upazila.id} value={upazila.id}>{upazila.name}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">সম্পর্কিত মাদ্রাসা</h4>
              <select name="related_madrasha" defaultValue={event?.related_madrasha ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="">নির্বাচন করুন</option>
                {madrashas.map((madrasha) => <option key={madrasha.id} value={madrasha.id}>{madrasha.madrasha_name}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">সম্পর্কিত খানকাহ</h4>
              <select name="related_khankah" defaultValue={event?.related_khankah ?? ""} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="">নির্বাচন করুন</option>
                {khankahs.map((khankah) => <option key={khankah.id} value={khankah.id}>{khankah.khankah_name}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaImage className="text-gray-400 w-3.5 h-3.5" /> পোস্টার
              </h4>
              {posterPreview ? (
                <div className="relative">
                  <Image src={posterPreview} alt="Event poster preview" width={320} height={176} className="w-full h-44 object-cover rounded-xl" unoptimized />
                  <button type="button" onClick={() => { setPosterPreview(null); setPosterFile(null); }} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600">
                    <FaTrash className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                  <FaImage className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">পোস্টার আপলোড করুন</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                </label>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaImages className="text-gray-400 w-3.5 h-3.5" /> ইভেন্ট গ্যালারি
              </h4>
              <ImageGalleryUpload existingImages={existingPhotos} onFilesChange={setGalleryFiles} onDeleteExistingImage={handleDeletedPhoto} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
