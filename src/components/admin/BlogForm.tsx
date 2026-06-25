"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaArrowLeft,
  FaBold,
  FaCog,
  FaEraser,
  FaHeading,
  FaImage,
  FaIndent,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaOutdent,
  FaQuoteRight,
  FaSave,
  FaSpinner,
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaTrash,
  FaUnderline,
} from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import BlogBlockEditor, { BlogBlock, BlogBlockPalette, BlogWidgetOption } from "./BlogBlockEditor";

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
  category: number | null;
  description: string;
  featured_image: string | null;
  content_blocks: BlogBlock[];
  status: "draft" | "published";
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const sync = () => onChange(editorRef.current?.innerHTML || "");

  const command = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    sync();
  };

  const addLink = () => {
    const url = window.prompt("লিংক URL দিন");
    if (url) command("createLink", url);
  };

  const addImage = () => {
    const url = window.prompt("ছবির URL দিন");
    if (url) command("insertImage", url);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
        <select onChange={(e) => command("fontName", e.target.value)} defaultValue="" className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600 outline-none">
          <option value="" disabled>Font</option>
          <option value="Arial">Sans Serif</option>
          <option value="Georgia">Serif</option>
          <option value="Courier New">Mono</option>
        </select>
        <select onChange={(e) => command("formatBlock", e.target.value)} defaultValue="p" className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600 outline-none">
          <option value="p">Normal</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>
        {[
          ["bold", <FaBold key="bold" />, "Bold"],
          ["italic", <FaItalic key="italic" />, "Italic"],
          ["underline", <FaUnderline key="underline" />, "Underline"],
          ["strikeThrough", <FaStrikethrough key="strike" />, "Strike"],
          ["superscript", <FaSuperscript key="sup" />, "Superscript"],
          ["subscript", <FaSubscript key="sub" />, "Subscript"],
          ["insertUnorderedList", <FaListUl key="ul" />, "Bullet list"],
          ["insertOrderedList", <FaListOl key="ol" />, "Number list"],
          ["outdent", <FaOutdent key="outdent" />, "Outdent"],
          ["indent", <FaIndent key="indent" />, "Indent"],
          ["justifyLeft", <FaAlignLeft key="left" />, "Left"],
          ["justifyCenter", <FaAlignCenter key="center" />, "Center"],
          ["justifyRight", <FaAlignRight key="right" />, "Right"],
        ].map(([cmd, icon, label]) => (
          <button key={String(cmd)} title={String(label)} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => command(String(cmd))} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-primary-700">
            {icon}
          </button>
        ))}
        <label className="flex h-9 cursor-pointer items-center rounded-lg px-2 text-xs font-bold text-gray-600 hover:bg-white hover:text-primary-700" title="Text color">
          A
          <input type="color" className="h-0 w-0 opacity-0" onChange={(e) => command("foreColor", e.target.value)} />
        </label>
        <label className="flex h-9 cursor-pointer items-center rounded-lg px-2 text-xs font-bold text-gray-600 hover:bg-white hover:text-primary-700" title="Highlight">
          <FaHeading />
          <input type="color" className="h-0 w-0 opacity-0" onChange={(e) => command("hiliteColor", e.target.value)} />
        </label>
        <button type="button" title="Quote" onMouseDown={(e) => e.preventDefault()} onClick={() => command("formatBlock", "blockquote")} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-primary-700">
          <FaQuoteRight />
        </button>
        <button type="button" title="Link" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-primary-700">
          <FaLink />
        </button>
        <button type="button" title="Image URL" onMouseDown={(e) => e.preventDefault()} onClick={addImage} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-primary-700">
          <FaImage />
        </button>
        <button type="button" title="Clear format" onMouseDown={(e) => e.preventDefault()} onClick={() => command("removeFormat")} className="rounded-lg p-2 text-gray-600 hover:bg-white hover:text-primary-700">
          <FaEraser />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        className="min-h-[260px] px-4 py-3 text-base leading-8 text-gray-800 outline-none prose prose-sm max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
        data-placeholder="এখানে ব্লগ বর্ণনা লিখুন..."
      />
    </div>
  );
}

export default function BlogForm({ postId }: BlogFormProps) {
  const router = useRouter();
  const isEdit = Boolean(postId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [blocks, setBlocks] = useState<BlogBlock[]>([]);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    const res = await authFetch("/blog/categories/");
    if (res.ok) {
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    }
  }, []);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await authFetch(`/blog/posts/${postId}/`);
      if (!res.ok) throw new Error("ব্লগ পোস্টের তথ্য লোড করতে সমস্যা হয়েছে।");
      const data = (await res.json()) as BlogPostDetail;
      setTitle(data.title || "");
      setCategory(data.category ? String(data.category) : "");
      setDescription(data.description || "");
      setStatus(data.status || "draft");
      setIsFeatured(Boolean(data.is_featured));
      setSeoTitle(data.seo_title || "");
      setSeoDescription(data.seo_description || "");
      setBlocks(data.content_blocks || []);
      setFeaturedPreview(data.featured_image ? mediaUrl(data.featured_image) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void fetchCategories();
    if (isEdit) void fetchPost();
  }, [fetchCategories, fetchPost, isEdit]);

  const handleFeaturedChange = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
      return;
    }
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  const addBlock = useCallback((option: BlogWidgetOption) => {
    setBlocks((prev) => [...prev, { type: option.type, data: { ...option.data } }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = new FormData();
    body.append("title", title);
    if (category) body.append("category", category);
    body.append("description", description);
    body.append("status", status);
    body.append("is_featured", isFeatured ? "true" : "false");
    body.append("seo_title", seoTitle);
    body.append("seo_description", seoDescription);
    body.append("content_blocks", JSON.stringify(blocks));
    if (featuredFile) body.append("featured_image", featuredFile);

    try {
      const res = await authFetch(isEdit ? `/blog/posts/${postId}/` : "/blog/posts/", {
        method: isEdit ? "PATCH" : "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const details = typeof data === "object" ? Object.values(data).flat().join(", ") : "";
        throw new Error(`ব্লগ পোস্ট সংরক্ষণ করতে সমস্যা হয়েছে। ${details}`);
      }
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FaSpinner className="h-9 w-9 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="sticky top-0 z-30 -mx-6 -mt-6 mb-6 border-b border-gray-200 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push("/admin/blog")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50">
              <FaArrowLeft />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">WordPress style editor</p>
              <h1 className="text-lg font-bold text-gray-900">{isEdit ? "ব্লগ পোস্ট সম্পাদনা" : "নতুন ব্লগ পোস্ট"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setStatus("draft")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Draft
            </button>
            <button type="submit" form="blog-editor-form" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:bg-primary-300">
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {status === "published" ? "Publish / Update" : "Save draft"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form id="blog-editor-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)_340px]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <BlogBlockPalette blocksCount={blocks.length} onAdd={addBlock} />
        </div>

        <div className="min-h-[calc(100vh-170px)] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 lg:px-14">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Add title"
              className="mb-5 w-full border-0 bg-transparent px-0 py-2 text-4xl font-bold text-gray-900 outline-none placeholder:text-gray-300 md:text-5xl"
            />
            <p className="mb-3 text-sm text-gray-400">Type your blog description below, then add blocks from the left panel.</p>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-5">
            <BlogBlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        <aside className="space-y-6 xl:self-start">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <FaCog className="text-primary-600" />
              <h2 className="font-bold text-gray-900">Post settings</h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="draft">খসড়া</option>
                  <option value="published">প্রকাশিত</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                Featured post
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-primary-600" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <FaImage className="text-primary-600" />
              Featured Image
            </h2>
            {featuredPreview ? (
              <div className="space-y-3">
                <img src={featuredPreview} alt="Featured preview" className="h-48 w-full rounded-2xl object-cover" />
                <button type="button" onClick={() => { setFeaturedFile(null); setFeaturedPreview(null); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                  <FaTrash /> ইমেজ পরিবর্তন করুন
                </button>
              </div>
            ) : (
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-500 hover:bg-gray-100">
                <FaImage className="mb-3 text-2xl text-gray-300" />
                কভার ছবি আপলোড করুন
                <span className="mt-1 text-xs text-gray-400">সর্বোচ্চ ৫MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFeaturedChange(e.target.files?.[0])} />
              </label>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-900">SEO</h2>
            <div className="space-y-3">
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="SEO description" rows={4} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
