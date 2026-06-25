"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaEye, FaSearch, FaSpinner, FaBookOpen, FaArrowRight } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    category_name: string;
    description: string;
    featured_image: string | null;
    status: string;
    is_featured: boolean;
    published_at: string | null;
    created_at: string;
    view_count: number;
}

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
}

function formatDate(value: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function BlogArchivePage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/blog/categories/`)
            .then((res) => res.ok ? res.json() : [])
            .then((data) => setCategories(Array.isArray(data) ? data : data.results || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (category) params.set("category", category);
            const res = await fetch(`${API_URL}/blog/posts/${params.toString() ? `?${params}` : ""}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : data.results || []);
            }
            setLoading(false);
        };
        const timer = setTimeout(load, 300);
        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0faf4] to-white pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-emerald-900 py-16 md:py-24 text-white">
                <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                        <FaBookOpen className="w-3.5 h-3.5" /> ব্লগ আর্কাইভ
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">ব্লগ</h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">ইসলামী জ্ঞান, শিক্ষা ও শাহপুর দরবার শরীফের খবরাখবর</p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4 mb-10 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ব্লগ পোস্ট খুঁজুন..."
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    >
                        <option value="">সকল ক্যাটাগরি</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <Breadcrumbs items={[{ label: "ব্লগ" }]} />

                {/* Posts Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <FaSpinner className="w-10 h-10 text-primary-500 mx-auto animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <FaBookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">কোনো ব্লগ পোস্ট পাওয়া যায়নি</h3>
                        <p className="text-gray-400 mt-2">ভিন্ন কিওয়ার্ড বা ক্যাটাগরি দিয়ে চেষ্টা করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all overflow-hidden flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-52 bg-gradient-to-br from-primary-50 to-emerald-50 overflow-hidden">
                                    {post.featured_image ? (
                                        <img
                                            src={mediaUrl(post.featured_image)}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaBookOpen className="w-12 h-12 text-primary-200" />
                                        </div>
                                    )}
                                    {post.is_featured && (
                                        <span className="absolute top-3 left-3 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                                            ফিচার্ড
                                        </span>
                                    )}
                                    {post.category_name && (
                                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-primary-100">
                                            {post.category_name}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                        <span className="inline-flex items-center gap-1">
                                            <FaCalendarAlt className="w-3 h-3" />
                                            {formatDate(post.published_at || post.created_at)}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <FaEye className="w-3 h-3" />
                                            {post.view_count}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-extrabold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                                        {stripHtml(post.description) || "বিস্তারিত পড়তে ক্লিক করুন..."}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary-600 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                                            বিস্তারিত পড়ুন <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
