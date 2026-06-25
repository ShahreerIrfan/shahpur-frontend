"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarAlt,
  FaEye,
  FaImage,
  FaLayerGroup,
  FaQuoteLeft,
  FaSpinner,
  FaTag,
} from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { API_URL } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface BlogBlock {
  type: "heading" | "text" | "image" | "gallery" | "quote" | "button" | "note" | "video" | "divider" | "list";
  data: Record<string, any>;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  description: string;
  featured_image: string | null;
  content_blocks: BlogBlock[];
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  view_count: number;
  seo_title: string;
  seo_description: string;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function youtubeEmbed(url: string) {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function imageAlignClass(align?: string) {
  if (align === "left") return "mr-auto";
  if (align === "right") return "ml-auto";
  return "mx-auto";
}

function renderBlock(block: BlogBlock, index: number) {
  const data = block.data || {};

  if (block.type === "heading") {
    const level = Number(data.level || 2);
    const base = "font-extrabold text-gray-900 leading-tight";
    if (level === 3) return <h3 key={index} className={`${base} text-2xl mt-10 mb-4`}>{data.text}</h3>;
    if (level === 4) return <h4 key={index} className={`${base} text-xl mt-8 mb-3`}>{data.text}</h4>;
    return <h2 key={index} className={`${base} text-3xl mt-12 mb-5`}>{data.text}</h2>;
  }

  if (block.type === "text") {
    return <p key={index} className="whitespace-pre-line text-[17px] leading-[2] text-gray-700 text-justify">{data.text}</p>;
  }

  if (block.type === "image") {
    const width = data.align === "full" ? 100 : Number(data.width || 100);
    return (
      <figure key={index} className={`my-8 ${imageAlignClass(data.align)}`} style={{ maxWidth: `${Math.min(Math.max(width, 25), 100)}%` }}>
        {data.url ? (
          <img src={mediaUrl(data.url)} alt={data.alt || ""} className="w-full h-auto rounded-2xl shadow-lg" />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-100"><FaImage className="h-12 w-12 text-gray-300" /></div>
        )}
        {data.caption && <figcaption className="mt-3 text-center text-sm italic text-gray-500">{data.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "gallery") {
    const images = Array.isArray(data.images) ? data.images : [];
    return (
      <div key={index} className="my-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((item: any, i: number) => (
          <figure key={i} className="overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
            {item.url && <img src={mediaUrl(item.url)} alt={item.alt || ""} className="w-full h-48 object-cover" />}
            {item.caption && <figcaption className="px-3 py-2 text-xs text-gray-500">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={index} className="my-10 relative pl-6 border-l-4 border-primary-500 bg-gradient-to-r from-primary-50/50 to-transparent py-6 pr-6 rounded-r-2xl">
        <FaQuoteLeft className="absolute -top-2 -left-3 text-primary-300 w-8 h-8 opacity-50" />
        <p className="text-xl font-semibold text-gray-800 leading-relaxed italic">{data.text}</p>
        {data.source && <footer className="mt-4 text-sm font-bold text-primary-700">— {data.source}</footer>}
      </blockquote>
    );
  }

  if (block.type === "button") {
    const align = data.align === "left" ? "justify-start" : data.align === "right" ? "justify-end" : "justify-center";
    return (
      <div key={index} className={`my-8 flex ${align}`}>
        <Link href={data.url || "#"} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-7 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-primary-600/20 transition-all hover:shadow-xl">
          {data.text || "আরও দেখুন"}
        </Link>
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <aside key={index} className="my-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-6">
        {data.title && <h3 className="text-lg font-extrabold text-amber-900 mb-2">{data.title}</h3>}
        <p className="whitespace-pre-line leading-8 text-amber-900/80">{data.text}</p>
      </aside>
    );
  }

  if (block.type === "video") {
    return (
      <figure key={index} className="my-10 overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
        <iframe src={youtubeEmbed(data.url)} className="aspect-video w-full" allowFullScreen title={data.caption || "Video"} />
        {data.caption && <figcaption className="bg-white px-5 py-3 text-sm text-gray-500">{data.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "divider") {
    return <hr key={index} className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />;
  }

  return null;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/blog/posts/${slug}/`, { cache: "no-store" });
        if (res.ok) setPost((await res.json()) as BlogPost);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug]);

  const blocks = useMemo(() => post?.content_blocks || [], [post]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><FaSpinner className="h-10 w-10 animate-spin text-primary-600" /></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaBookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">পোস্ট পাওয়া যায়নি</h2>
          <Link href="/blog" className="inline-block mt-4 text-primary-600 font-bold">← ব্লগে ফিরে যান</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero with featured image */}
      {post.featured_image && (
        <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden bg-gray-900">
          <img
            src={mediaUrl(post.featured_image)}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category_name && (
                <span className="inline-flex items-center gap-1 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  <FaTag className="w-2.5 h-2.5" /> {post.category_name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                <FaCalendarAlt className="w-2.5 h-2.5" /> {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                <FaEye className="w-2.5 h-2.5" /> {post.view_count} পাঠ
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">{post.title}</h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* If no featured image, show title differently */}
        {!post.featured_image && (
          <header className="pt-12 pb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 text-sm font-bold mb-6 hover:text-primary-700">
              <FaArrowLeft className="w-3 h-3" /> সকল ব্লগ পোস্ট
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category_name && (
                <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-100">
                  <FaTag className="w-2.5 h-2.5" /> {post.category_name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                <FaCalendarAlt /> {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                <FaEye /> {post.view_count} পাঠ
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
          </header>
        )}

        {/* Breadcrumbs */}
        <div className={post.featured_image ? "pt-6" : ""}>
          <Breadcrumbs items={[{ label: "ব্লগ", url: "/blog" }, { label: post.title }]} />
        </div>

        {/* Back link when featured image exists */}
        {post.featured_image && (
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 text-sm font-bold mt-6 hover:text-primary-700">
            <FaArrowLeft className="w-3 h-3" /> সকল ব্লগ পোস্ট
          </Link>
        )}

        {/* Article Content */}
        <article className="mt-8">
          {/* Description (rich text from editor) */}
          {post.description && (
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-extrabold prose-p:text-gray-700 prose-p:leading-[2] prose-p:text-justify prose-a:text-primary-600 prose-a:font-bold prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/30 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-ul:ml-6 prose-ol:ml-6"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          )}

          {/* Content Blocks */}
          {blocks.length > 0 && (
            <div className="mt-12 space-y-6">
              {blocks.map((block, index) => renderBlock(block, index))}
            </div>
          )}

          {/* Empty content fallback */}
          {!post.description && blocks.length === 0 && (
            <div className="rounded-3xl bg-gray-50 border border-gray-100 p-12 text-center">
              <FaBookOpen className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <p className="text-gray-500 font-medium">এই ব্লগ পোস্টে এখনও বিস্তারিত কনটেন্ট যোগ করা হয়নি।</p>
            </div>
          )}
        </article>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:text-primary-700 transition-colors">
            <FaArrowLeft className="w-3 h-3" /> আরও ব্লগ পোস্ট পড়ুন
          </Link>
        </div>
      </div>
    </div>
  );
}
