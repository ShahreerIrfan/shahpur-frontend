"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaFolderOpen, FaPlus, FaSave, FaSearch, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { BookCategory } from "@/lib/books";

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

const emptyForm = {
  name: "",
  description: "",
  order: "0",
  is_active: true,
};

export default function BookCategoriesPage() {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authFetch("/books/categories/");
      if (!res.ok) throw new Error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as BookCategory[] | ApiList<BookCategory>;
      setCategories(listFromResponse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (category: BookCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description,
      order: String(category.order),
      is_active: category.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    body.append("name", form.name);
    body.append("description", form.description);
    body.append("order", form.order || "0");
    body.append("is_active", form.is_active ? "true" : "false");

    try {
      const res = await authFetch(editingId ? `/books/categories/${editingId}/` : "/books/categories/", {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) throw new Error("ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে।");
      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ক্যাটাগরি মুছে ফেলতে চান?")) return;
    const res = await authFetch(`/books/categories/${id}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setCategories((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError("ক্যাটাগরি মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filtered = categories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">বই ক্যাটাগরি</h1>
          <p className="text-sm text-gray-500 mt-1">বই লাইব্রেরির ক্যাটাগরি ট্যাক্সোনমি পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FaPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">{editingId ? "ক্যাটাগরি আপডেট" : "নতুন ক্যাটাগরি"}</h2>
              <p className="text-xs text-gray-400">নাম, বর্ণনা ও ক্রম দিন</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্যাটাগরির নাম *</label>
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">বর্ণনা</label>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={4} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্রম</label>
              <input value={form.order} onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))} type="number" min="0" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
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
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="ক্যাটাগরি খুঁজুন..." />
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
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">বই</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{category.name}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{category.description || "বর্ণনা নেই"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{category.books_count}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${category.is_active ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                            {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => startEdit(category)} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
                              <FaEdit className="w-3 h-3" />
                            </button>
                            <button onClick={() => void handleDelete(category.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
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
                    <p className="text-sm text-gray-500">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
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
