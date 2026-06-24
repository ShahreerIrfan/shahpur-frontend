"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaEye, 
  FaBookOpen, 
  FaCheckCircle, 
  FaTimesCircle 
} from "react-icons/fa";
import Pagination from "@/components/ui/Pagination";
import { authFetch } from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  status: "draft" | "published";
  published_date: string | null;
  created_at: string;
}

interface BlogCategory {
  id: number;
  name: string;
}

interface ApiList<T> {
  results?: T[];
  count?: number;
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
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authFetch("/blog/categories/");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  const fetchPosts = useCallback(async (currentPage = page, currentSearch = search, currentCategory = categoryFilter, currentStatus = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      if (currentSearch.trim()) params.set("search", currentSearch.trim());
      if (currentCategory) params.set("category", currentCategory);
      if (currentStatus) params.set("status", currentStatus);

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
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts(page, search, categoryFilter, statusFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, categoryFilter, statusFilter, fetchPosts]);

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    const action = post.status === "published" ? "unpublish" : "publish";
    try {
      const res = await authFetch(`/blog/posts/${post.id}/${action}/`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? { ...p, status: data.status, published_date: data.published_date || null }
              : p
          )
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} post`, err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/blog/posts/${deleteId}/`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setPosts(posts.filter((p) => p.id !== deleteId));
        setDeleteId(null);
        setCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBookOpen className="text-primary-600 w-6 h-6" />
            ব্লগ পোস্ট সমূহ
          </h1>
          <p className="text-sm text-gray-500">ওয়েবসাইটের সকল ব্লগ পোস্ট তৈরি ও পরিচালনা করুন</p>
        </div>

        <Link
          href="/admin/blog/create"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-sm transition h-fit"
        >
          <FaPlus className="w-3.5 h-3.5" />
          নতুন পোস্ট লিখুন
        </Link>
      </div>

      {/* Filters card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <FaSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="পোস্টের শিরোনাম বা সংক্ষিপ্ত বিবরণ অনুসন্ধান..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">সকল ক্যাটাগরি</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">সকল স্ট্যাটাস</option>
            <option value="draft">খসড়া (Draft)</option>
            <option value="published">প্রকাশিত (Published)</option>
          </select>
        </div>
      </div>

      {/* List content */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <FaBookOpen className="w-12 h-12 mb-3 text-gray-200" />
            <p>কোনো ব্লগ পোস্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4 text-right">ক্রমিক</th>
                  <th className="py-3 px-4 text-right">শিরোনাম</th>
                  <th className="py-3 px-4 text-right">ক্যাটাগরি</th>
                  <th className="py-3 px-4 text-right">অবস্থা</th>
                  <th className="py-3 px-4 text-right">প্রকাশের তারিখ</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {posts.map((post, index) => {
                  const sl = (page - 1) * PAGE_SIZE + index + 1;
                  return (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4 text-gray-400 text-right">{sl}</td>
                      <td className="py-4 px-4 font-semibold text-gray-800 text-right max-w-xs truncate" title={post.title}>
                        {post.title}
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-right">{post.category_name || "—"}</td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            post.status === "published"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-105 text-gray-600 border-gray-200"
                          }`}
                        >
                          {post.status === "published" ? "প্রকাশিত" : "খসড়া"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-right">
                        {post.published_date
                          ? new Date(post.published_date).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(post)}
                            disabled={togglingId === post.id}
                            className={`p-1.5 rounded-lg transition ${
                              post.status === "published"
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={post.status === "published" ? "খসড়া করুন" : "প্রকাশ করুন"}
                          >
                            {togglingId === post.id ? (
                              <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : post.status === "published" ? (
                              <FaTimesCircle className="w-4 h-4" />
                            ) : (
                              <FaCheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/blog/${post.slug}?preview=true`}
                            target="_blank"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="প্রিভিউ দেখুন"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="সম্পাদনা"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteId(post.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-sm text-gray-500 mb-6">
              এই ব্লগ পোস্টটি মুছে ফেলা হবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-150 rounded-xl transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
