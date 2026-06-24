"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaFolderOpen, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import Pagination from "@/components/ui/Pagination";
import { API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category_name: string;
  category_slug: string;
  published_date: string | null;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface ApiList<T> {
  results?: T[];
  count?: number;
}

export default function BlogArchivePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/blog/categories/`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }, []);

  const fetchPosts = useCallback(async (currentPage = page, currentCategory = categoryFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("status", "published"); // Public only sees published
      if (currentCategory) params.set("category_slug", currentCategory);

      const res = await fetch(`${API_URL}/blog/posts/?${params.toString()}`);
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
  }, [page, categoryFilter]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchPosts(page, categoryFilter);
  }, [page, categoryFilter, fetchPosts]);

  const handleCategoryChange = (slug: string) => {
    setCategoryFilter(slug);
    setPage(1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Format date in Bengali
  const formatDateBn = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero 
        title="ব্লগ ও নিবন্ধ" 
        subtitle="ইসলামী জ্ঞান, ইতিহাস, ও শাহপুর দরবার শরীফের বিশেষ বয়ানসমূহ" 
        showBismillah={true} 
      />
      <Breadcrumbs items={[{ label: "ব্লগ ও নিবন্ধ" }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex items-center gap-2 mb-3 px-2">
            <FaFolderOpen className="text-primary-650 w-4 h-4" />
            <h2 className="text-sm font-bold text-gray-700">বিষয়শ্রেণী সমূহ</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                categoryFilter === ""
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                  : "bg-gray-50 text-gray-650 border-gray-100 hover:bg-gray-100"
              }`}
            >
              সকল পোস্ট
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  categoryFilter === cat.slug
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-gray-50 text-gray-650 border-gray-100 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-24">
            <FaSpinner className="w-10 h-10 text-primary-500 mx-auto animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <FaFolderOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">এই ক্যাটাগরিতে কোনো পোস্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-white rounded-[28px] border border-primary-100/80 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-950/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Decorative internal border */}
                  <div className="absolute inset-2 rounded-[22px] border border-amber-100/80 pointer-events-none z-10"></div>
                  
                  {/* Top colored line accent */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-amber-300 to-primary-600 z-20"></div>

                  {/* Thumbnail */}
                  <div className="relative h-52 bg-gradient-to-br from-primary-50 to-primary-100/50 overflow-hidden">
                    {post.featured_image ? (
                      <Image
                        src={mediaUrl(post.featured_image)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-50/30">
                        <FaFolderOpen className="w-16 h-16 text-primary-200" />
                      </div>
                    )}

                    {post.category_name && (
                      <span className="absolute top-4 right-4 bg-primary-900/90 text-gold-light border border-gold-light/40 px-3 py-1 rounded-full text-[10px] font-bold z-20 shadow-sm backdrop-blur-sm">
                        {post.category_name}
                      </span>
                    )}
                  </div>

                  {/* Content body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FaCalendarAlt className="w-3.5 h-3.5 text-amber-500" />
                        <span>{formatDateBn(post.published_date)}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-750 transition-colors">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                        {post.excerpt || "পোস্টটির কোনো সংক্ষিপ্ত বর্ণনা উপলব্ধ নেই। বিস্তারিত পড়তে নিচের লিংকে ক্লিক করুন।"}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="pt-5 mt-4 border-t border-gray-55 flex justify-end">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 group-hover:text-primary-800 transition"
                      >
                        বিস্তারিত পড়ুন
                        <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
