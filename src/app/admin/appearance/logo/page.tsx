"use client";

import { useEffect, useState } from "react";
import { FaImage, FaSave, FaSpinner } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { SiteSettings } from "@/lib/appearance";
import { mediaUrl } from "@/lib/media";

const emptyForm = {
  site_name: "শাহপুর দরবার শরীফ",
  site_name_en: "Shahpur Darbar Sharif",
  tagline: "ইসলামী শরীয়াতের অনুশীলন ও আধ্যাত্মিক সাধনার কেন্দ্র",
  phone: "",
  email: "",
  address: "",
  facebook_url: "",
  youtube_url: "",
  about_text: "",
};

export default function AppearanceLogoPage() {
  const [form, setForm] = useState(emptyForm);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewVersion, setPreviewVersion] = useState(Date.now());

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await authFetch("/core/settings/");
        if (!res.ok) throw new Error("লোগো সেটিংস লোড করতে সমস্যা হয়েছে।");
        const data = (await res.json()) as SiteSettings;
        setSettings(data);
        setForm({
          site_name: data.site_name || emptyForm.site_name,
          site_name_en: data.site_name_en || emptyForm.site_name_en,
          tagline: data.tagline || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          facebook_url: data.facebook_url || "",
          youtube_url: data.youtube_url || "",
          about_text: data.about_text || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const updateForm = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (logoFile) body.append("logo", logoFile);
    if (faviconFile) body.append("favicon", faviconFile);

    try {
      const res = await authFetch("/core/settings/", { method: "PATCH", body });
      if (!res.ok) throw new Error("লোগো সংরক্ষণ করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as SiteSettings;
      setSettings(data);
      setLogoFile(null);
      setFaviconFile(null);
      setPreviewVersion(Date.now());
      window.dispatchEvent(new Event("site-settings-updated"));
      setSuccess("লোগো ও সাইট পরিচিতি আপডেট হয়েছে।");
    } catch (err) {
      setError(err instanceof Error ? err.message : "লোগো সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const withPreviewVersion = (url: string) => url ? `${url}${url.includes("?") ? "&" : "?"}v=${previewVersion}` : "";
  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : withPreviewVersion(mediaUrl(settings?.logo));
  const faviconPreview = faviconFile ? URL.createObjectURL(faviconFile) : withPreviewVersion(mediaUrl(settings?.favicon));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">লোগো ও সাইট পরিচিতি</h1>
        <p className="text-sm text-gray-500 mt-1">ওয়েবসাইটের লোগো, favicon, নাম ও tagline পরিবর্তন করুন</p>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}

      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
          <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 text-sm">সেটিংস লোড হচ্ছে...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-5">সাইট তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">সাইটের নাম *</label>
                <input value={form.site_name} onChange={(e) => updateForm("site_name", e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ইংরেজি নাম</label>
                <input value={form.site_name_en} onChange={(e) => updateForm("site_name_en", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tagline</label>
                <textarea value={form.tagline} onChange={(e) => updateForm("tagline", e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ফোন</label>
                <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ইমেইল</label>
                <input value={form.email} onChange={(e) => updateForm("email", e.target.value)} type="email" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ঠিকানা</label>
                <textarea value={form.address} onChange={(e) => updateForm("address", e.target.value)} rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Facebook URL</label>
                <input value={form.facebook_url} onChange={(e) => updateForm("facebook_url", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">YouTube URL</label>
                <input value={form.youtube_url} onChange={(e) => updateForm("youtube_url", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-5">লোগো</h2>
              <div className="space-y-4">
                <div className="h-36 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {logoPreview ? <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain p-4" /> : <FaImage className="w-9 h-9 text-gray-300" />}
                </div>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("লোগো ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
                    e.target.value = "";
                    setLogoFile(null);
                    return;
                  }
                  setLogoFile(file);
                }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-5">Favicon</h2>
              <div className="space-y-4">
                <div className="h-28 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]">
                  <div className="w-20 h-20 rounded-full bg-white/70 shadow-sm border border-white/80 flex items-center justify-center overflow-hidden">
                    {faviconPreview ? <img src={faviconPreview} alt="Favicon preview" className="w-full h-full rounded-full object-contain" /> : <FaImage className="w-8 h-8 text-gray-300" />}
                  </div>
                </div>
                <p className="text-xs text-gray-400">ব্রাউজার ট্যাব আইকন এখানে গোল ও transparent preview হিসেবে দেখাবে</p>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("ফ্যাভিকন ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
                    e.target.value = "";
                    setFaviconFile(null);
                    return;
                  }
                  setFaviconFile(file);
                }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 rounded-xl text-sm font-medium transition-all">
              <FaSave className="w-3.5 h-3.5" />
              {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
