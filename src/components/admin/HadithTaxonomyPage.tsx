"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaFolderOpen, FaPlus, FaSave, FaSearch, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { HadithBook, HadithCollection, listFromResponse } from "@/lib/hadith";

type TaxonomyType = "collections" | "books" | "chapters" | "narrators" | "grades" | "topics";

interface TaxonomyItem {
  id: number;
  name?: string;
  title?: string;
  short_name?: string;
  arabic_name?: string;
  arabic_title?: string;
  book_number?: string;
  chapter_number?: string;
  color?: string;
  description?: string;
  biography?: string;
  collection?: number;
  collection_name?: string;
  book?: number;
  book_name?: string;
  is_active: boolean;
  order: number;
  hadiths_count?: number;
}

interface HadithTaxonomyPageProps {
  type: TaxonomyType;
  title: string;
  subtitle: string;
  primaryLabel: string;
}

const initialForm = {
  name: "",
  title: "",
  short_name: "",
  arabic_name: "",
  arabic_title: "",
  book_number: "",
  chapter_number: "",
  color: "green",
  description: "",
  biography: "",
  collection: "",
  book: "",
  order: "0",
  is_active: true,
};

export default function HadithTaxonomyPage({ type, title, subtitle, primaryLabel }: HadithTaxonomyPageProps) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  const fetchItems = useCallback(async () => {
    const res = await authFetch(`/hadith/${type}/`);
    if (!res.ok) throw new Error(`${title} লোড করতে সমস্যা হয়েছে।`);
    const data = (await res.json()) as TaxonomyItem[] | { results?: TaxonomyItem[] };
    setItems(listFromResponse(data));
  }, [title, type]);

  const fetchOptions = useCallback(async () => {
    if (type !== "books" && type !== "chapters") return;
    const [collectionRes, bookRes] = await Promise.all([
      authFetch("/hadith/collections/"),
      authFetch("/hadith/books/"),
    ]);
    if (collectionRes.ok) {
      const data = (await collectionRes.json()) as HadithCollection[] | { results?: HadithCollection[] };
      setCollections(listFromResponse(data));
    }
    if (bookRes.ok) {
      const data = (await bookRes.json()) as HadithBook[] | { results?: HadithBook[] };
      setBooks(listFromResponse(data));
    }
  }, [type]);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchItems(), fetchOptions()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [fetchItems, fetchOptions]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const updateForm = (key: keyof typeof initialForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      title: item.title || "",
      short_name: item.short_name || "",
      arabic_name: item.arabic_name || "",
      arabic_title: item.arabic_title || "",
      book_number: item.book_number || "",
      chapter_number: item.chapter_number || "",
      color: item.color || "green",
      description: item.description || "",
      biography: item.biography || "",
      collection: item.collection ? String(item.collection) : "",
      book: item.book ? String(item.book) : "",
      order: String(item.order ?? 0),
      is_active: item.is_active,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    if (type === "chapters") {
      body.append("title", form.title);
      body.append("arabic_title", form.arabic_title);
      body.append("chapter_number", form.chapter_number);
      if (form.book) body.append("book", form.book);
    } else {
      body.append("name", form.name);
      if (type === "collections") body.append("short_name", form.short_name);
      if (type === "books") {
        body.append("arabic_name", form.arabic_name);
        body.append("book_number", form.book_number);
        if (form.collection) body.append("collection", form.collection);
      }
      if (type === "narrators") {
        body.append("arabic_name", form.arabic_name);
      }
      if (type === "grades") body.append("color", form.color);
    }
    body.append(type === "narrators" ? "biography" : "description", type === "narrators" ? form.biography : form.description);
    body.append("order", form.order || "0");
    body.append("is_active", form.is_active ? "true" : "false");

    try {
      const res = await authFetch(editingId ? `/hadith/${type}/${editingId}/` : `/hadith/${type}/`, {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) throw new Error(`${title} সংরক্ষণ করতে সমস্যা হয়েছে।`);
      resetForm();
      await fetchItems();
      await fetchOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${title} সংরক্ষণ করতে সমস্যা হয়েছে।`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?")) return;
    const res = await authFetch(`/hadith/${type}/${id}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const labelOf = (item: TaxonomyItem) => item.name || item.title || "";
  const filtered = items.filter((item) =>
    [labelOf(item), item.description, item.biography, item.collection_name, item.book_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FaPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{editingId ? "আপডেট" : "নতুন যোগ করুন"}</h2>
              <p className="text-xs text-gray-400">{primaryLabel} তথ্য দিন</p>
            </div>
          </div>

          <div className="space-y-4">
            {type === "books" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">সংকলন *</label>
                <select value={form.collection} onChange={(e) => updateForm("collection", e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">সংকলন নির্বাচন করুন</option>
                  {collections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
            )}
            {type === "chapters" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">কিতাব *</label>
                <select value={form.book} onChange={(e) => updateForm("book", e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">কিতাব নির্বাচন করুন</option>
                  {books.map((item) => <option key={item.id} value={item.id}>{item.collection_name} - {item.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{primaryLabel} *</label>
              <input value={type === "chapters" ? form.title : form.name} onChange={(e) => updateForm(type === "chapters" ? "title" : "name", e.target.value)} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            {type === "collections" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">সংক্ষিপ্ত নাম</label>
                <input value={form.short_name} onChange={(e) => updateForm("short_name", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            )}

            {(type === "books" || type === "narrators") && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">আরবি নাম</label>
                <input value={form.arabic_name} onChange={(e) => updateForm("arabic_name", e.target.value)} dir="rtl" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            )}

            {type === "chapters" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">আরবি পরিচ্ছেদ</label>
                <input value={form.arabic_title} onChange={(e) => updateForm("arabic_title", e.target.value)} dir="rtl" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            )}

            {(type === "books" || type === "chapters") && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{type === "books" ? "বই নম্বর" : "পরিচ্ছেদ নম্বর"}</label>
                <input value={type === "books" ? form.book_number : form.chapter_number} onChange={(e) => updateForm(type === "books" ? "book_number" : "chapter_number", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            )}

            {type === "grades" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">রঙ</label>
                <select value={form.color} onChange={(e) => updateForm("color", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="amber">Amber</option>
                  <option value="red">Red</option>
                  <option value="gray">Gray</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{type === "narrators" ? "পরিচিতি" : "বর্ণনা"}</label>
              <textarea value={type === "narrators" ? form.biography : form.description} onChange={(e) => updateForm(type === "narrators" ? "biography" : "description", e.target.value)} rows={4} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্রম</label>
              <input value={form.order} onChange={(e) => updateForm("order", e.target.value)} type="number" min="0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <label className="flex items-center justify-between text-xs text-gray-600">
              সক্রিয়
              <input type="checkbox" checked={form.is_active} onChange={(e) => updateForm("is_active", e.target.checked)} className="w-4 h-4 accent-primary-500" />
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="খুঁজুন..." />
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
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">নাম</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">হাদিস</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{labelOf(item)}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.collection_name || item.book_name || item.description || item.biography || "বর্ণনা নেই"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.hadiths_count ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${item.is_active ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                            {item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={() => startEdit(item)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                              <FaEdit className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => void handleDelete(item.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
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
                    <FaFolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">কোনো তথ্য পাওয়া যায়নি</p>
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
