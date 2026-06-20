"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { FaEdit, FaImage, FaPlus, FaSave, FaSearch, FaSpinner, FaTrash, FaUserEdit } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { BookAuthor, mediaUrl } from "@/lib/books";

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

const emptyForm = {
  name: "",
  title: "",
  biography: "",
  order: "0",
  is_active: true,
};

export default function BookAuthorsPage() {
  const [authors, setAuthors] = useState<BookAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await authFetch("/books/authors/");
      if (!res.ok) throw new Error("লেখক তালিকা লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as BookAuthor[] | ApiList<BookAuthor>;
      setAuthors(listFromResponse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuthors();
  }, [fetchAuthors]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const startEdit = (author: BookAuthor) => {
    setEditingId(author.id);
    setForm({
      name: author.name,
      title: author.title,
      biography: author.biography,
      order: String(author.order),
      is_active: author.is_active,
    });
    setPhotoFile(null);
    setPhotoPreview(author.photo ? mediaUrl(author.photo) : null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    body.append("name", form.name);
    body.append("title", form.title);
    body.append("biography", form.biography);
    body.append("order", form.order || "0");
    body.append("is_active", form.is_active ? "true" : "false");
    if (photoFile) {
      body.append("photo", photoFile);
    }

    try {
      const res = await authFetch(editingId ? `/books/authors/${editingId}/` : "/books/authors/", {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) throw new Error("লেখক সংরক্ষণ করতে সমস্যা হয়েছে।");
      resetForm();
      await fetchAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "লেখক সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই লেখক মুছে ফেলতে চান?")) return;
    const res = await authFetch(`/books/authors/${id}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setAuthors((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError("লেখক মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filtered = authors.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.biography.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">বই লেখক</h1>
          <p className="text-sm text-gray-500 mt-1">বই লাইব্রেরির লেখক ট্যাক্সোনমি পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FaPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{editingId ? "লেখক আপডেট" : "নতুন লেখক"}</h2>
              <p className="text-xs text-gray-400">নাম, পরিচয়, জীবনী ও ছবি দিন</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">লেখকের নাম *</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">উপাধি/পরিচয়</label>
              <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="যেমন: মুফতি / গবেষক / অনুবাদক" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">জীবনী</label>
              <textarea value={form.biography} onChange={(e) => setForm((prev) => ({ ...prev, biography: e.target.value }))} rows={4} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্রম</label>
              <input value={form.order} onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))} type="number" min="0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">লেখকের ছবি</label>
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100">
                  <Image src={photoPreview} alt="Author preview" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                  <FaImage className="w-6 h-6" />
                </div>
              )}
              <label className="mt-2 inline-flex cursor-pointer text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                ছবি আপলোড
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <label className="flex items-center justify-between text-xs text-gray-600">
              সক্রিয়
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} className="w-4 h-4 accent-primary-500" />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                <FaSave className="w-3.5 h-3.5" />
                {saving ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট" : "সংরক্ষণ"}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600">বাতিল</button>}
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="লেখক খুঁজুন..." />
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
              <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 text-sm">তথ্য লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">লেখক</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">বই</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((author) => (
                      <tr key={author.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 overflow-hidden flex items-center justify-center text-primary-500">
                              {author.photo ? <Image src={mediaUrl(author.photo)} alt={author.name} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : <FaUserEdit className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{author.name}</p>
                              <p className="text-xs text-gray-400 mt-1">{author.title || "পরিচয় নেই"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{author.books_count}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${author.is_active ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                            {author.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => startEdit(author)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                              <FaEdit className="w-3 h-3" />
                            </button>
                            <button onClick={() => void handleDelete(author.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-14">
                    <FaUserEdit className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">কোনো লেখক পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
