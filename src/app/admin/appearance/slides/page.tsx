"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaImage, FaPlus, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { HomeSlide, listFromResponse } from "@/lib/appearance";
import { mediaUrl } from "@/lib/media";

const emptyForm = {
  eyebrow: "আধ্যাত্মিক সাধনার কেন্দ্র",
  title: "",
  subtitle: "",
  primary_button_text: "বাগদাদী হুজুর (রাঃ) এঁর জীবনী",
  primary_button_url: "/biography/baghdadi",
  secondary_button_text: "মাও. আব্দুস সুবহান (রাঃ)",
  secondary_button_url: "/biography/subhan",
  stat_one_value: "৪০+",
  stat_one_label: "মাদ্রাসা",
  stat_two_value: "১৫০+",
  stat_two_label: "খানকাহ শরীফ",
  stat_three_value: "১৭+",
  stat_three_label: "দেশ সফর",
  order: "0",
  is_active: true,
};

type SlideFormState = typeof emptyForm;

export default function AppearanceSlidesPage() {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [form, setForm] = useState<SlideFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSlides = useCallback(async () => {
    try {
      const res = await authFetch("/core/sliders/");
      if (!res.ok) throw new Error("স্লাইড লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as HomeSlide[] | { results?: HomeSlide[] };
      setSlides(listFromResponse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSlides();
  }, [fetchSlides]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setCurrentImage("");
  };

  const updateForm = (key: keyof SlideFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (slide: HomeSlide) => {
    setEditingId(slide.id);
    setForm({
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      primary_button_text: slide.primary_button_text || "",
      primary_button_url: slide.primary_button_url || "",
      secondary_button_text: slide.secondary_button_text || "",
      secondary_button_url: slide.secondary_button_url || "",
      stat_one_value: slide.stat_one_value || "",
      stat_one_label: slide.stat_one_label || "",
      stat_two_value: slide.stat_two_value || "",
      stat_two_label: slide.stat_two_label || "",
      stat_three_value: slide.stat_three_value || "",
      stat_three_label: slide.stat_three_label || "",
      order: String(slide.order ?? 0),
      is_active: slide.is_active,
    });
    setImageFile(null);
    setCurrentImage(mediaUrl(slide.background_image || slide.image));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      body.append(key, typeof value === "boolean" ? String(value) : value);
    });
    if (imageFile) body.append("background_image", imageFile);

    try {
      const res = await authFetch(editingId ? `/core/sliders/${editingId}/` : "/core/sliders/", {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) throw new Error("স্লাইড সংরক্ষণ করতে সমস্যা হয়েছে।");
      resetForm();
      await fetchSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "স্লাইড সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই স্লাইডটি মুছে ফেলতে চান?")) return;
    const res = await authFetch(`/core/sliders/${id}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setSlides((prev) => prev.filter((slide) => slide.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError("স্লাইড মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">হোম স্লাইড</h1>
        <p className="text-sm text-gray-500 mt-1">হোম পেজের hero slider এর লেখা, ছবি, বাটন ও পরিসংখ্যান পরিচালনা করুন</p>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 2xl:grid-cols-[460px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FaPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{editingId ? "স্লাইড আপডেট" : "নতুন স্লাইড"}</h2>
              <p className="text-xs text-gray-400">Hero section এর সব তথ্য দিন</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ছোট লেবেল</label>
              <input value={form.eyebrow} onChange={(e) => updateForm("eyebrow", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">শিরোনাম *</label>
              <textarea value={form.title} onChange={(e) => updateForm("title", e.target.value)} required rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder={"শাহপুর দরবার\nশরীফ"} />
              <p className="text-[11px] text-gray-400 mt-1">লাইন ভাঙতে Enter ব্যবহার করুন</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">বর্ণনা</label>
              <textarea value={form.subtitle} onChange={(e) => updateForm("subtitle", e.target.value)} rows={4} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রথম বাটন</label>
                <input value={form.primary_button_text} onChange={(e) => updateForm("primary_button_text", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রথম বাটন URL</label>
                <input value={form.primary_button_url} onChange={(e) => updateForm("primary_button_url", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">দ্বিতীয় বাটন</label>
                <input value={form.secondary_button_text} onChange={(e) => updateForm("secondary_button_text", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">দ্বিতীয় বাটন URL</label>
                <input value={form.secondary_button_url} onChange={(e) => updateForm("secondary_button_url", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["stat_one_value", "১ম সংখ্যা"], ["stat_one_label", "১ম লেবেল"],
                ["stat_two_value", "২য় সংখ্যা"], ["stat_two_label", "২য় লেবেল"],
                ["stat_three_value", "৩য় সংখ্যা"], ["stat_three_label", "৩য় লেবেল"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input value={form[key as keyof SlideFormState] as string} onChange={(e) => updateForm(key as keyof SlideFormState, e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্রম</label>
                <input value={form.order} onChange={(e) => updateForm("order", e.target.value)} type="number" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <label className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                সক্রিয়
                <input type="checkbox" checked={form.is_active} onChange={(e) => updateForm("is_active", e.target.checked)} className="w-4 h-4 accent-primary-500" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ব্যাকগ্রাউন্ড ছবি</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
                  e.target.value = "";
                  setImageFile(null);
                  return;
                }
                setImageFile(file);
              }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <p className="text-[11px] text-gray-400 mt-1">সেরা ফলাফলের জন্য 2400 x 900px ছবি ব্যবহার করুন (ratio 8:3)। একই ratio হলে hero section এ পুরো ছবি clean দেখাবে। Minimum 1920 x 720px.</p>
              {(imageFile || currentImage) && (
                <div className="mt-3 aspect-[8/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-950">
                  <img src={imageFile ? URL.createObjectURL(imageFile) : currentImage} alt="Slide preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                <FaSave className="w-3.5 h-3.5" />
                {saving ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট" : "সংরক্ষণ"}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">বাতিল</button>}
            </div>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 text-sm">স্লাইড লোড হচ্ছে...</p>
            </div>
          ) : slides.length === 0 ? (
            <div className="p-16 text-center">
              <FaImage className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">এখনো কোনো স্লাইড নেই</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্লাইড</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্রম</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {slides.map((slide) => (
                    <tr key={slide.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-10 rounded-xl overflow-hidden bg-gray-950 flex-shrink-0">
                            {(slide.background_image || slide.image) ? <img src={mediaUrl(slide.background_image || slide.image)} alt={slide.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-primary-500"><FaImage /></div>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{slide.title}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{slide.subtitle || "বর্ণনা নেই"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{slide.order}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${slide.is_active ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                          {slide.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(slide)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button onClick={() => void handleDelete(slide.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
