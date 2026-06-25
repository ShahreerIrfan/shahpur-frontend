"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaEdit, FaEye, FaPlus, FaSearch, FaSpinner, FaStar, FaTrash } from "react-icons/fa";
import Pagination from "@/components/ui/Pagination";
import { authFetch } from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  description: string;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  view_count: number;
}

interface BlogCategory {
  id: number;
  name: string;
}

interface ApiList<T> {
  results?: T[];
  count?: number;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchCategories = useCallback(async () => {
    const res = await authFetch("/blog/categories/");
    if (res.ok) {
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search.trim()) params.set("search", search.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await authFetch(`/blog/posts/?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as BlogPost[] | ApiList<BlogPost>;
        if (Array.isArray(data)) {
          setPosts(data);
          setCount(data.length);
        } else {
          setPosts(data.results || []);
          setCount(data.count || 0);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, search, statusFilter]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchPosts(), 250);
    return () => window.clearTimeout(timer);
  }, [fetchPosts]);

  const resetPage = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await authFetch(`/blog/posts/${deleteId}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setPosts((prev) => prev.filter((item) => item.id !== deleteId));
      setCount((prev) => Math.max(0, prev - 1));
      setDeleteId(null);
    }
    setDeleting(false);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FaBookOpen className="text-primary-600" />
            ব্লগ পোস্ট
          </h1>
          <p className="mt-1 text-sm text-gray-500">ব্লগ পোস্ট, ক্যাটাগরি, বর্ণনা এবং কাস্টম উইজেট পরিচালনা করুন</p>
        </div>
        <Link href="/admin/blog/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700">
          <FaPlus className="h-3.5 w-3.5" />
          নতুন ব্লগ পোস্ট
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => resetPage(setSearch, e.target.value)} placeholder="Title, description অথবা category খুঁজুন..." className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => resetPage(setCategoryFilter, e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">সকল ক্যাটাগরি</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => resetPage(setStatusFilter, e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">সকল স্ট্যাটাস</option>
            <option value="published">প্রকাশিত</option>
            <option value="draft">খসড়া</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <FaSpinner className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <FaBookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">কোনো ব্লগ পোস্ট নেই</h3>
            <p className="mt-1 text-sm text-gray-500">প্রথম ব্লগ পোস্ট যোগ করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">SL</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Views</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 text-sm text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        {post.is_featured && <FaStar className="mt-1 h-3.5 w-3.5 text-amber-500" />}
                        <div>
                          <p className="text-sm font-bold text-gray-900">{post.title}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-gray-400">{stripHtml(post.description) || "বর্ণনা নেই"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{post.category_name || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${post.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {post.status === "published" ? "প্রকাশিত" : "খসড়া"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{post.view_count}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                          <FaEye className="h-3.5 w-3.5" />
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <FaEdit className="h-3.5 w-3.5" />
                        </Link>
                        <button onClick={() => setDeleteId(post.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">ব্লগ পোস্ট মুছবেন?</h3>
            <p className="mt-2 text-sm text-gray-500">এই কাজটি আর ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">বাতিল</button>
              <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-red-300">
                {deleting && <FaSpinner className="animate-spin" />}
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
