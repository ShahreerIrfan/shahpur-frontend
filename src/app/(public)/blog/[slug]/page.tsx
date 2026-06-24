"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaFolderOpen, 
  FaSpinner, 
  FaArrowRight 
} from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import { API_URL, authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface BlogBlock {
  type: string;
  data: any;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category_name: string;
  published_date: string | null;
}

interface BlogPostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category_name: string;
  category_slug: string;
  published_date: string | null;
  seo_title: string;
  seo_description: string;
  content_blocks: BlogBlock[];
  status: "draft" | "published";
  related_posts: RelatedPost[];
}

export default function BlogPostDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params.slug as string;
  const isPreview = searchParams.get("preview") === "true";

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPostDetails = useCallback(async () => {
    setLoading(true);
    try {
      let res: Response;
      const url = `${API_URL}/blog/posts/${slug}/`;
      
      if (isPreview) {
        // Authenticated request to preview drafts
        res = await authFetch(`/blog/posts/${slug}/`);
      } else {
        // Public request
        res = await fetch(url);
      }

      if (res.ok) {
        const data = (await res.json()) as BlogPostDetail;
        setPost(data);
        
        // Dynamically set document title and meta description for basic SEO inside client-side page
        document.title = `${data.seo_title || data.title} | শাহপুর দরবার শরীফ`;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data.seo_description) {
          metaDesc.setAttribute("content", data.seo_description);
        }
      } else {
        if (res.status === 404) {
          setError("আর্টিকেলটি খুঁজে পাওয়া যায়নি।");
        } else {
          setError("তথ্য লোড করতে ত্রুটি হয়েছে।");
        }
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  }, [slug, isPreview]);

  useEffect(() => {
    if (slug) {
      void fetchPostDetails();
    }
  }, [slug, fetchPostDetails]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 min-h-screen">
        <FaSpinner className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex flex-col justify-center items-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <FaFolderOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">সমস্যা হয়েছে</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি।"}</p>
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition mx-auto"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            ব্লগ হোমে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-24">
      {/* Dynamic Header */}
      <PageHero 
        title={post.title} 
        subtitle={post.category_name ? `${post.category_name} ক্যাটাগরি` : ""} 
        showBismillah={false} 
      />
      <Breadcrumbs 
        items={[
          { label: "ব্লগ ও নিবন্ধ", url: "/blog" },
          { label: post.title }
        ]} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Main article content card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-10 shadow-sm relative overflow-hidden">
            {/* Decorative inner frame */}
            <div className="absolute inset-2 rounded-[22px] border border-amber-100/50 pointer-events-none z-10"></div>
            
            {/* Top colored accent line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-amber-300 to-primary-600 z-20"></div>

            <article className="max-w-3xl mx-auto space-y-6 pt-4">
              {/* Category, Date & Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {post.category_name && (
                  <span className="bg-primary-900 text-gold-light border border-gold-light/35 px-3.5 py-1 rounded-full font-bold">
                    {post.category_name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                  <FaCalendarAlt className="w-3.5 h-3.5 text-amber-500" />
                  <span>{formatDateBn(post.published_date)}</span>
                </div>
                {post.status === "draft" && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    খসড়া প্রিভিউ
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 leading-snug tracking-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-gray-650 text-sm md:text-base leading-relaxed italic border-l-4 border-amber-400 bg-amber-50/20 pl-4 py-2 rounded-r-xl">
                  {post.excerpt}
                </p>
              )}

              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative h-[250px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-sm my-6 border border-gray-100">
                  <Image
                    src={mediaUrl(post.featured_image)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Content block widgets render */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                {post.content_blocks && post.content_blocks.map((block, idx) => {
                  switch (block.type) {
                    case "paragraph":
                      return (
                        <p key={idx} className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                          {block.data.text}
                        </p>
                      );
                    case "heading":
                      const Level = `h${block.data.level || 2}` as React.ElementType;
                      const sizeClass = 
                        block.data.level === 2 ? "text-xl md:text-2xl" : 
                        block.data.level === 3 ? "text-lg md:text-xl" : "text-base md:text-lg";
                      return (
                        <Level key={idx} className={`${sizeClass} font-bold text-primary-800 mt-8 mb-3`}>
                          {block.data.text}
                        </Level>
                      );
                    case "image":
                      return (
                        <div key={idx} className="space-y-1.5 text-center my-6">
                          <div className="relative h-60 md:h-[400px] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                            {block.data.url && (
                              <Image
                                src={mediaUrl(block.data.url)}
                                alt={block.data.alt || ""}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                              />
                            )}
                          </div>
                          {block.data.caption && (
                            <span className="text-xs text-gray-500 italic block">{block.data.caption}</span>
                          )}
                        </div>
                      );
                    case "gallery":
                      const images = block.data.images || [];
                      return (
                        <div key={idx} className="my-8">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img: any, iIdx: number) => (
                              <div key={iIdx} className="space-y-1 text-center">
                                <div className="relative h-32 md:h-44 w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                  {img.url && (
                                    <Image
                                      src={mediaUrl(img.url)}
                                      alt={img.alt || ""}
                                      fill
                                      className="object-cover hover:scale-105 transition duration-500"
                                      sizes="(max-width: 768px) 50vw, 300px"
                                    />
                                  )}
                                </div>
                                {img.caption && (
                                  <span className="text-[10px] text-gray-455 italic block">{img.caption}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    case "quote":
                      return (
                        <blockquote key={idx} className="my-8 p-6 bg-amber-50/30 border-r-4 border-amber-500 rounded-2xl relative text-right">
                          <span className="text-6xl text-amber-250/50 absolute top-2 left-6 font-serif">”</span>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed italic z-10 relative">
                            {block.data.text}
                          </p>
                          {block.data.source && (
                            <footer className="text-xs text-gray-500 font-semibold mt-3">— {block.data.source}</footer>
                          )}
                        </blockquote>
                      );
                    case "video":
                      return (
                        <div key={idx} className="space-y-2 my-8 text-center">
                          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-100">
                            {block.data.url && (
                              <iframe
                                src={block.data.url}
                                className="w-full h-full"
                                allowFullScreen
                                title={block.data.caption || "Video embed"}
                              ></iframe>
                            )}
                          </div>
                          {block.data.caption && (
                            <span className="text-xs text-gray-500 italic block">{block.data.caption}</span>
                          )}
                        </div>
                      );
                    case "button":
                      const align = 
                        block.data.alignment === "left" ? "justify-start" : 
                        block.data.alignment === "right" ? "justify-end" : "justify-center";
                      return (
                        <div key={idx} className={`flex w-full my-6 ${align}`}>
                          <a
                            href={block.data.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition shadow-sm"
                          >
                            {block.data.text || "লিংক বাটন"}
                          </a>
                        </div>
                      );
                    case "note":
                      const isIslamic = block.data.isIslamic ?? true;
                      const cardStyle = isIslamic
                        ? "bg-primary-50/40 border-r-4 border-primary-600"
                        : "bg-gray-50 border-r-4 border-gray-500";
                      return (
                        <div key={idx} className={`p-6 rounded-2xl my-6 text-right ${cardStyle}`}>
                          {block.data.title && (
                            <h4 className={`text-sm md:text-base font-bold mb-2 ${isIslamic ? "text-primary-850" : "text-gray-800"}`}>
                              {block.data.title}
                            </h4>
                          )}
                          <p className="text-gray-750 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                            {block.data.text}
                          </p>
                        </div>
                      );
                    case "html":
                      return (
                        <div 
                          key={idx} 
                          className="my-6" 
                          dangerouslySetInnerHTML={{ __html: block.data.code || "" }} 
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </article>
          </div>

          {/* Sidebar - Related posts */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                সম্পর্কিত অন্যান্য পোস্ট
              </h3>

              {post.related_posts && post.related_posts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">কোনো সম্পর্কিত পোস্ট পাওয়া যায়নি</p>
              ) : (
                <div className="space-y-4">
                  {post.related_posts && post.related_posts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group flex gap-3 p-2 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        {rel.featured_image ? (
                          <Image
                            src={mediaUrl(rel.featured_image)}
                            alt={rel.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-50/30">
                            <FaFolderOpen className="w-6 h-6 text-primary-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-750 transition-colors">
                          {rel.title}
                        </h4>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span>{formatDateBn(rel.published_date)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Back to Blog List */}
            <Link
              href="/blog"
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-55 text-primary-700 font-semibold py-3 px-4 rounded-2xl text-xs border border-primary-100 hover:border-primary-200 transition shadow-sm"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
              সকল ব্লগ ও নিবন্ধ দেখুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
