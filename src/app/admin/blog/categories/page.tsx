"use client";

import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaFolderOpen, FaPlus, FaSave, FaSearch, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
};

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authFetch("/blog/categories/");
      if (!res.ok) throw new Error("ক্যাটাগরি লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as BlogCategory[] | ApiList<BlogCategory>;
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

  const startEdit = (category: BlogCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      is_active: category.is_active,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    body.append("name", form.name);
    if (form.slug.trim()) {
      body.append("slug", form.slug);
    }
    body.append("description", form.description);
    body.append("is_active", form.is_active ? "true" : "false");

    try {
      const res = await authFetch(editingId ? `/blog/categories/${editingId}/` : "/blog/categories/", {
        method: editingId ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const details = typeof errorData === 'object' ? Object.values(errorData).flat().join(", ") : "";
        throw new Error(`ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে। ${details}`);
      }
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
    const res = await authFetch(`/blog/categories/${id}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setCategories((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError("ক্যাটাগরি মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredCategories = categories.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700">
          <FaFolderOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ব্লগ ক্যাটাগরি</h1>
          <p className="text-sm text-gray-500">ব্লগ পোস্টের জন্য ক্যাটাগরি ব্যবস্থাপনা করুন</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {editingId ? <FaEdit className="w-4 h-4 text-amber-500" /> : <FaPlus className="w-4 h-4 text-primary-500" />}
            {editingId ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি যোগ করুন"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ক্যাটাগরির নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="উদা: ইসলামের ইতিহাস"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                স্লাগ (Slug)
              </label>
              <input
                type="text"
                placeholder="ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                বর্ণনা
              </label>
              <textarea
                rows={3}
                placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ লিখুন..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer select-none">
                এই ক্যাটাগরি সক্রিয় আছে
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50"
              >
                {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                {editingId ? "হালনাগাদ করুন" : "সংরক্ষণ করুন"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl text-sm transition"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="ক্যাটাগরি অনুসন্ধান করুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
              <FaFolderOpen className="w-12 h-12 mb-3 text-gray-200" />
              <p>কোনো ক্যাটাগরি পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4 text-right">নাম</th>
                    <th className="py-3 px-4 text-right">স্লাগ</th>
                    <th className="py-3 px-4 text-right">অবস্থা</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 font-medium text-gray-800 text-right">{category.name}</td>
                      <td className="py-3.5 px-4 text-gray-500 text-right">{category.slug}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.is_active
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="সম্পাদনা"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <FaTrash className="w-4 h-4" />
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
