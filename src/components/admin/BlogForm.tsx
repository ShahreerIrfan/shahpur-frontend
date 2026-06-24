"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaBookOpen, FaEye, FaPen, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import BlogBlockEditor, { BlogBlock } from "./BlogBlockEditor";

interface BlogFormProps {
  postId?: string;
}

interface BlogCategory {
  id: number;
  name: string;
}

interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category: number | null;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
  content_blocks: BlogBlock[];
}

export default function BlogForm({ postId }: BlogFormProps) {
  const router = useRouter();
  const isEdit = Boolean(postId);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Post fields state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authFetch("/blog/categories/");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }, []);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await authFetch(`/blog/posts/${postId}/`);
      if (!res.ok) throw new Error("ব্লগ পোস্টের তথ্য লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as BlogPostDetail;
      
      setTitle(data.title);
      setSlug(data.slug);
      setCategory(data.category ? String(data.category) : "");
      setExcerpt(data.excerpt);
      setStatus(data.status);
      setSeoTitle(data.seo_title || "");
      setSeoDescription(data.seo_description || "");
      setBlocks(data.content_blocks || []);
      if (data.featured_image) {
        setImagePreview(mediaUrl(data.featured_image));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const load = async () => {
      await fetchCategories();
      if (isEdit) {
        await fetchPost();
      }
    };
    void load();
  }, [isEdit, fetchCategories, fetchPost]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    body.append("title", title);
    if (slug.trim()) body.append("slug", slug.trim());
    if (category) body.append("category", category);
    body.append("excerpt", excerpt);
    body.append("status", status);
    body.append("seo_title", seoTitle);
    body.append("seo_description", seoDescription);
    body.append("content_blocks", JSON.stringify(blocks));

    if (imageFile) {
      body.append("featured_image", imageFile);
    } else if (imagePreview === null) {
      // Clear featured image
      body.append("featured_image", "");
    }

    try {
      const url = isEdit ? `/blog/posts/${postId}/` : "/blog/posts/";
      const method = isEdit ? "PATCH" : "POST";
      const res = await authFetch(url, { method, body });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const details = typeof errorData === 'object' ? Object.values(errorData).flat().join(", ") : "";
        throw new Error(`পোস্ট সংরক্ষণ করতে সমস্যা হয়েছে। ${details}`);
      }

      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <FaSpinner className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-600 transition"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {isEdit ? "পোস্ট সম্পাদনা করুন" : "নতুন ব্লগ পোস্ট লিখুন"}
            </h1>
            <p className="text-xs text-gray-500">ওয়ার্ডপ্রেসের মতো ব্লক এডিটরের মাধ্যমে আর্টিকেল সাজান</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-100 border border-gray-200 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "edit" ? "bg-white text-primary-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaPen className="w-3.5 h-3.5" />
            এডিটর
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "preview" ? "bg-white text-primary-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaEye className="w-3.5 h-3.5" />
            প্রিভিউ
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {activeTab === "edit" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Slug */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    পোস্টের শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="শিরোনাম লিখুন..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    স্লাগ (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="ফাঁকা রাখলে শিরোনাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Block builder editor */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">আর্টিকেল কনটেন্ট সাজান</h2>
                <BlogBlockEditor blocks={blocks} onChange={setBlocks} />
              </div>

              {/* SEO Settings */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-1">SEO অপটিমাইজেশন</h2>
                <p className="text-xs text-gray-400 mb-4">সার্চ ইঞ্জিনে দেখানোর জন্য মেটা তথ্য যুক্ত করুন</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO শিরোনাম</label>
                  <input
                    type="text"
                    placeholder="SEO টাইটেল..."
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO মেটা বিবরণ (Description)</label>
                  <textarea
                    rows={3}
                    placeholder="সার্চ ইঞ্জিনে দেখানোর জন্য সংক্ষিপ্ত বিবরণ লিখুন..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right sidebar settings */}
            <div className="space-y-6">
              {/* Category, Status & Save */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-gray-800">পোস্ট সেটিংস</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্ট্যাটাস (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="draft">খসড়া (Draft)</option>
                    <option value="published">প্রকাশিত (Published)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                  >
                    {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                    পোস্ট সংরক্ষণ করুন
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
                <label className="block text-sm font-semibold text-gray-750">পোস্টের সংক্ষিপ্ত বিবরণ (Excerpt)</label>
                <textarea
                  rows={4}
                  placeholder="পাঠকদের জন্য পোস্টের একটি সংক্ষিপ্ত পরিচিতি বা সারাংশ লিখুন..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Featured Image */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <label className="block text-sm font-semibold text-gray-800">ফিচার্ড ইমেজ</label>

                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative h-48 w-full border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                      <Image 
                        src={imagePreview} 
                        alt="Featured image preview" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-semibold py-2 px-3 rounded-xl text-xs border border-red-200 transition"
                    >
                      <FaTrash className="w-3 h-3" />
                      ইমেজ পরিবর্তন করুন
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-250 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-1 text-xs text-gray-500 font-semibold">পিসি থেকে ফিচার্ড ইমেজ আপলোড করুন</p>
                      <p className="text-[10px] text-gray-400">JPG, PNG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Live rendered preview of the post blocks */
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header info */}
            <div>
              {category && (
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-semibold mb-3">
                  {categories.find(c => String(c.id) === category)?.name || ""}
                </span>
              )}
              <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
                {title || "পোস্টের শিরোনাম এখানে দেখা যাবে"}
              </h1>
              <div className="text-xs text-gray-400 mt-2">
                প্রকাশের অবস্থা: <span className="font-semibold text-primary-600">{status === "published" ? "প্রকাশিত" : "খসড়া"}</span>
              </div>
            </div>

            {/* Featured Image */}
            {imagePreview && (
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-sm">
                <Image 
                  src={imagePreview} 
                  alt={title} 
                  fill 
                  className="object-cover" 
                />
              </div>
            )}

            {/* Excerpt */}
            {excerpt && (
              <p className="text-base text-gray-500 italic border-l-4 border-amber-300 pl-4 py-1 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Content Blocks */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              {blocks.length === 0 ? (
                <p className="text-gray-400 text-center py-10">কোনো কনটেন্ট ব্লক যুক্ত করা হয়নি</p>
              ) : (
                blocks.map((block, idx) => {
                  switch (block.type) {
                    case "paragraph":
                      return (
                        <p key={idx} className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                          {block.data.text}
                        </p>
                      );
                    case "heading":
                      const Level = `h${block.data.level || 2}` as React.ElementType;
                      const sizeClass = 
                        block.data.level === 2 ? "text-2xl" : 
                        block.data.level === 3 ? "text-xl" : "text-lg";
                      return (
                        <Level key={idx} className={`${sizeClass} font-bold text-gray-800 mt-6 mb-2`}>
                          {block.data.text}
                        </Level>
                      );
                    case "image":
                      return (
                        <div key={idx} className="space-y-1 text-center my-4">
                          <div className="relative h-80 w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                            {block.data.url ? (
                              <Image 
                                src={mediaUrl(block.data.url)} 
                                alt={block.data.alt || ""} 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">ইমেজ লিংক নেই</div>
                            )}
                          </div>
                          {block.data.caption && (
                            <span className="text-xs text-gray-450 italic">{block.data.caption}</span>
                          )}
                        </div>
                      );
                    case "gallery":
                      const galleryImages = block.data.images || [];
                      return (
                        <div key={idx} className="my-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {galleryImages.map((img: any, iIdx: number) => (
                              <div key={iIdx} className="space-y-1 text-center">
                                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                                  {img.url ? (
                                    <Image 
                                      src={mediaUrl(img.url)} 
                                      alt={img.alt || ""} 
                                      fill 
                                      className="object-cover hover:scale-105 transition duration-550" 
                                    />
                                  ) : (
                                    <div className="text-gray-400 text-xs">ইমেজ নেই</div>
                                  )}
                                </div>
                                {img.caption && (
                                  <span className="text-[10px] text-gray-400 italic block">{img.caption}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    case "quote":
                      return (
                        <blockquote key={idx} className="my-6 p-5 bg-amber-50/50 border-r-4 border-amber-500 rounded-2xl relative text-right">
                          <span className="text-5xl text-amber-200 absolute top-2 left-4 font-serif">”</span>
                          <p className="text-gray-700 text-base leading-relaxed italic z-10 relative">
                            {block.data.text}
                          </p>
                          {block.data.source && (
                            <footer className="text-xs text-gray-500 font-semibold mt-2.5">— {block.data.source}</footer>
                          )}
                        </blockquote>
                      );
                    case "video":
                      return (
                        <div key={idx} className="space-y-1.5 my-6 text-center">
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-100 flex items-center justify-center">
                            {block.data.url ? (
                              <iframe
                                src={block.data.url}
                                className="w-full h-full"
                                allowFullScreen
                                title="Video embed preview"
                              ></iframe>
                            ) : (
                              <div className="text-gray-400 text-xs">ভিডিও লিংক নেই</div>
                            )}
                          </div>
                          {block.data.caption && (
                            <span className="text-xs text-gray-450 italic">{block.data.caption}</span>
                          )}
                        </div>
                      );
                    case "button":
                      const alignment = 
                        block.data.alignment === "left" ? "justify-start" : 
                        block.data.alignment === "right" ? "justify-end" : "justify-center";
                      return (
                        <div key={idx} className={`flex w-full my-4 ${alignment}`}>
                          <a
                            href={block.data.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition shadow-sm"
                          >
                            {block.data.text || "লিংক বাটন"}
                          </a>
                        </div>
                      );
                    case "note":
                      const isIslamic = block.data.isIslamic ?? true;
                      const cardStyle = isIslamic
                        ? "bg-primary-50/50 border-r-4 border-primary-600"
                        : "bg-gray-50 border-r-4 border-gray-500";
                      return (
                        <div key={idx} className={`p-5 rounded-2xl my-6 text-right ${cardStyle}`}>
                          {block.data.title && (
                            <h4 className={`text-sm font-bold mb-1.5 ${isIslamic ? "text-primary-850" : "text-gray-800"}`}>
                              {block.data.title}
                            </h4>
                          )}
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {block.data.text}
                          </p>
                        </div>
                      );
                    case "html":
                      return (
                        <div 
                          key={idx} 
                          className="my-4 border border-dashed border-gray-200 p-4 rounded-xl font-mono text-xs overflow-auto bg-gray-50"
                        >
                          <div className="text-[10px] text-gray-400 mb-1 border-b border-gray-200 pb-1">কাস্টম HTML কোড রেন্ডার (নিরাপত্তার স্বার্থে প্রিভিউতে র কোড দেখানো হচ্ছে):</div>
                          <code>{block.data.code}</code>
                        </div>
                      );
                    default:
                      return null;
                  }
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
