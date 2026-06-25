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
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
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

function buttonAlignClass(align?: string) {
  if (align === "left") return "justify-start";
  if (align === "right") return "justify-end";
  return "justify-center";
}

function renderBlock(block: BlogBlock, index: number) {
  const data = block.data || {};

  if (block.type === "heading") {
    const level = Number(data.level || 2);
    const className = "font-extrabold text-primary-950 leading-tight";
    if (level === 3) return <h3 key={index} className={`${className} text-2xl`}>{data.text}</h3>;
    if (level === 4) return <h4 key={index} className={`${className} text-xl`}>{data.text}</h4>;
    return <h2 key={index} className={`${className} text-3xl`}>{data.text}</h2>;
  }

  if (block.type === "text") {
    return (
      <p key={index} className="whitespace-pre-line text-lg leading-9 text-gray-700">
        {data.text}
      </p>
    );
  }

  if (block.type === "image") {
    const width = data.align === "full" ? 100 : Number(data.width || 100);
    return (
      <figure key={index} className={`${imageAlignClass(data.align)}`} style={{ width: `${Math.min(Math.max(width, 25), 100)}%` }}>
        {data.url ? (
          <img src={mediaUrl(data.url)} alt={data.alt || data.caption || ""} className="h-auto w-full rounded-3xl border border-primary-100 bg-white object-contain shadow-sm" />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-3xl bg-primary-50 text-primary-300">
            <FaImage className="h-12 w-12" />
          </div>
        )}
        {data.caption && <figcaption className="mt-2 text-center text-sm text-gray-500">{data.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "gallery") {
    const images = Array.isArray(data.images) ? data.images : [];
    return (
      <div key={index} className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3">
        {images.map((item: any, imageIndex: number) => (
          <figure key={imageIndex} className="break-inside-avoid overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
            {item.url && <img src={mediaUrl(item.url)} alt={item.alt || item.caption || ""} className="h-auto w-full object-contain" />}
            {item.caption && <figcaption className="px-4 py-3 text-sm text-gray-600">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={index} className="rounded-3xl border-l-4 border-primary-600 bg-primary-50/80 p-6 text-xl font-semibold leading-9 text-primary-950">
        <FaQuoteLeft className="mb-3 text-primary-500" />
        {data.text}
        {data.source && <footer className="mt-4 text-sm font-bold text-primary-700">- {data.source}</footer>}
      </blockquote>
    );
  }

  if (block.type === "button") {
    return (
      <div key={index} className={`flex ${buttonAlignClass(data.align)}`}>
        <Link href={data.url || "#"} className="rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
          {data.text || "আরও দেখুন"}
        </Link>
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <aside key={index} className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        {data.title && <h3 className="mb-2 text-xl font-extrabold text-amber-950">{data.title}</h3>}
        <p className="whitespace-pre-line leading-8 text-amber-950/80">{data.text}</p>
      </aside>
    );
  }

  if (block.type === "video") {
    return (
      <figure key={index} className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
        <iframe src={youtubeEmbed(data.url)} className="aspect-video w-full" allowFullScreen title={data.caption || "Blog video"} />
        {data.caption && <figcaption className="px-5 py-3 text-sm text-gray-500">{data.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "divider") {
    return <div key={index} className="my-8 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />;
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FaSpinner className="h-9 w-9 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!post) {
    return <div className="min-h-screen py-20 text-center text-gray-500">ব্লগ পোস্ট পাওয়া যায়নি</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5fbf7] pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-emerald-950 py-10 text-white md:py-14">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-300/60 to-transparent" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/90 hover:bg-white/15">
              <FaArrowLeft className="h-3 w-3" />
              হোমে ফিরে যান
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                <FaLayerGroup className="h-3 w-3" />
                ব্লগ আর্টিকেল
              </span>
              {post.category_name && <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-50">{post.category_name}</span>}
              {post.is_featured && <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">ফিচার্ড</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
            <span className="inline-flex items-center gap-2">
              <FaCalendarAlt /> {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="inline-flex items-center gap-2">
              <FaEye /> {post.view_count} পাঠ
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Breadcrumbs items={[{ label: "ব্লগ" }, { label: post.title }]} />

        <article className="mt-8 overflow-hidden rounded-[2rem] border border-primary-100 bg-white shadow-[0_25px_70px_rgba(3,77,55,0.08)]">
          {post.featured_image && (
            <figure className="border-b border-primary-50 bg-[#eefaf3]">
              <img src={mediaUrl(post.featured_image)} alt={post.title} className="mx-auto h-auto w-full object-contain" />
            </figure>
          )}

          <header className="mx-auto max-w-4xl px-5 pb-4 pt-8 md:px-10 md:pt-12">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {post.category_name && <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">{post.category_name}</span>}
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                <FaCalendarAlt /> {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                <FaEye /> {post.view_count} পাঠ
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-primary-950 md:text-5xl">{post.title}</h1>
          </header>

          <div className="mx-auto max-w-4xl px-5 pb-8 md:px-10 md:pb-12">
            {post.description && (
              <div className="prose prose-lg max-w-none rounded-3xl bg-primary-50/35 p-5 prose-headings:text-primary-950 prose-a:text-primary-700 prose-p:leading-9 prose-ul:ml-6 prose-ul:list-disc prose-ol:ml-6 prose-ol:list-decimal md:p-7" dangerouslySetInnerHTML={{ __html: post.description }} />
            )}

            {blocks.length > 0 && (
              <div className="mt-10 space-y-8">
                {blocks.map((block, index) => renderBlock(block, index))}
              </div>
            )}

            {blocks.length === 0 && !post.description && (
              <div className="rounded-3xl bg-primary-50 p-10 text-center text-primary-700">
                <FaBookOpen className="mx-auto mb-3 h-9 w-9" />
                এই ব্লগ পোস্টে এখনও বিস্তারিত কনটেন্ট যোগ করা হয়নি।
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
