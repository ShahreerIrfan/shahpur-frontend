"use client";

import { useState } from "react";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaArrowDown,
  FaArrowUp,
  FaGripLines,
  FaHeading,
  FaImage,
  FaImages,
  FaLink,
  FaListUl,
  FaPlus,
  FaQuoteLeft,
  FaSpinner,
  FaStickyNote,
  FaTrash,
  FaUpload,
  FaVideo,
} from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

export interface BlogBlock {
  type: "heading" | "text" | "image" | "gallery" | "quote" | "button" | "note" | "video" | "divider" | "list";
  data: Record<string, any>;
}

interface BlogBlockEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

const widgetOptions: { type: BlogBlock["type"]; label: string; icon: React.ReactNode; data: Record<string, any> }[] = [
  { type: "heading", label: "হেডিং", icon: <FaHeading />, data: { level: 2, text: "" } },
  { type: "text", label: "টেক্সট", icon: <FaListUl />, data: { text: "" } },
  { type: "image", label: "ছবি", icon: <FaImage />, data: { url: "", alt: "", caption: "", width: 100, align: "center" } },
  { type: "gallery", label: "গ্যালারি", icon: <FaImages />, data: { images: [] } },
  { type: "quote", label: "উক্তি", icon: <FaQuoteLeft />, data: { text: "", source: "" } },
  { type: "button", label: "বাটন", icon: <FaLink />, data: { text: "", url: "", align: "center" } },
  { type: "note", label: "নোট কার্ড", icon: <FaStickyNote />, data: { title: "", text: "" } },
  { type: "video", label: "ভিডিও", icon: <FaVideo />, data: { url: "", caption: "" } },
  { type: "divider", label: "ডিভাইডার", icon: <FaGripLines />, data: { style: "line" } },
];

export default function BlogBlockEditor({ blocks, onChange }: BlogBlockEditorProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const addBlock = (option: (typeof widgetOptions)[number]) => {
    onChange([...blocks, { type: option.type, data: { ...option.data } }]);
  };

  const updateBlock = (index: number, data: Record<string, any>) => {
    const next = [...blocks];
    next[index] = { ...next[index], data: { ...next[index].data, ...data } };
    onChange(next);
  };

  const removeBlock = (index: number) => {
    const next = [...blocks];
    next.splice(index, 1);
    onChange(next);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const uploadImage = async (file: File, key: string) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
      return null;
    }
    setUploading(key);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await authFetch("/blog/upload/", { method: "POST", body });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.path as string;
    } catch {
      alert("ইমেজ আপলোড করতে সমস্যা হয়েছে।");
      return null;
    } finally {
      setUploading(null);
    }
  };

  const uploadSingleImage = async (file: File | undefined, index: number) => {
    if (!file) return;
    const path = await uploadImage(file, `image-${index}`);
    if (path) updateBlock(index, { url: path });
  };

  const uploadGalleryImage = async (file: File | undefined, blockIndex: number, imageIndex: number) => {
    if (!file) return;
    const path = await uploadImage(file, `gallery-${blockIndex}-${imageIndex}`);
    if (!path) return;
    const images = [...(blocks[blockIndex].data.images || [])];
    images[imageIndex] = { ...images[imageIndex], url: path };
    updateBlock(blockIndex, { images });
  };

  const addGalleryItem = (index: number) => {
    const images = [...(blocks[index].data.images || []), { url: "", alt: "", caption: "" }];
    updateBlock(index, { images });
  };

  const updateGalleryItem = (blockIndex: number, imageIndex: number, data: Record<string, any>) => {
    const images = [...(blocks[blockIndex].data.images || [])];
    images[imageIndex] = { ...images[imageIndex], ...data };
    updateBlock(blockIndex, { images });
  };

  const removeGalleryItem = (blockIndex: number, imageIndex: number) => {
    const images = [...(blocks[blockIndex].data.images || [])];
    images.splice(imageIndex, 1);
    updateBlock(blockIndex, { images });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">কাস্টম উইজেট যোগ করুন</h3>
            <p className="text-xs text-gray-500">ছবি, গ্যালারি, হেডিং, টেক্সট, বাটনসহ যত খুশি ব্লক যোগ করা যাবে।</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">{blocks.length} ব্লক</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
          {widgetOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => addBlock(option)}
              className="flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <span className="text-primary-600">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          এখনো কোনো কাস্টম উইজেট যোগ করা হয়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={`${block.type}-${index}`} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">{block.type}</span>
                  <span className="ml-2 text-xs text-gray-400">ব্লক {index + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-30">
                    <FaArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:opacity-30">
                    <FaArrowDown className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => removeBlock(index)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {block.type === "heading" && (
                  <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                    <select value={block.data.level || 2} onChange={(e) => updateBlock(index, { level: Number(e.target.value) })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value={2}>H2 বড় শিরোনাম</option>
                      <option value={3}>H3 মাঝারি</option>
                      <option value={4}>H4 ছোট</option>
                    </select>
                    <input value={block.data.text || ""} onChange={(e) => updateBlock(index, { text: e.target.value })} placeholder="হেডিং লিখুন..." className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}

                {block.type === "text" && (
                  <textarea value={block.data.text || ""} onChange={(e) => updateBlock(index, { text: e.target.value })} rows={5} placeholder="টেক্সট লিখুন..." className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                )}

                {block.type === "image" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_150px]">
                      <input value={block.data.url || ""} onChange={(e) => updateBlock(index, { url: e.target.value })} placeholder="ছবির URL বা আপলোড করুন" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                        {uploading === `image-${index}` ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                        ছবি আপলোড
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadSingleImage(e.target.files?.[0], index)} />
                      </label>
                    </div>
                    {block.data.url && (
                      <img src={mediaUrl(block.data.url)} alt={block.data.alt || ""} className="max-h-56 rounded-xl border border-gray-100 object-cover" style={{ width: `${block.data.width || 100}%` }} />
                    )}
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={block.data.alt || ""} onChange={(e) => updateBlock(index, { alt: e.target.value })} placeholder="Alt text" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      <input value={block.data.caption || ""} onChange={(e) => updateBlock(index, { caption: e.target.value })} placeholder="ক্যাপশন" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                      <label className="text-xs font-semibold text-gray-500">
                        ছবির সাইজ: {block.data.width || 100}%
                        <input type="range" min="25" max="100" value={block.data.width || 100} onChange={(e) => updateBlock(index, { width: Number(e.target.value) })} className="mt-2 w-full accent-primary-600" />
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          ["left", <FaAlignLeft key="left" />],
                          ["center", <FaAlignCenter key="center" />],
                          ["right", <FaAlignRight key="right" />],
                          ["full", "Full"],
                        ].map(([value, icon]) => (
                          <button key={String(value)} type="button" onClick={() => updateBlock(index, { align: value, width: value === "full" ? 100 : block.data.width || 70 })} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${block.data.align === value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500"}`}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {block.type === "gallery" && (
                  <div className="space-y-3">
                    <button type="button" onClick={() => addGalleryItem(index)} className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100">
                      <FaPlus /> গ্যালারি ছবি যোগ
                    </button>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(block.data.images || []).map((img: any, imageIndex: number) => (
                        <div key={imageIndex} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                          {img.url && <img src={mediaUrl(img.url)} alt={img.alt || ""} className="mb-3 h-32 w-full rounded-lg object-cover" />}
                          <div className="space-y-2">
                            <input value={img.url || ""} onChange={(e) => updateGalleryItem(index, imageIndex, { url: e.target.value })} placeholder="ছবির URL" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs" />
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                                {uploading === `gallery-${index}-${imageIndex}` ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                                আপলোড
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadGalleryImage(e.target.files?.[0], index, imageIndex)} />
                              </label>
                              <button type="button" onClick={() => removeGalleryItem(index, imageIndex)} className="rounded-lg bg-red-50 px-3 text-red-600">
                                <FaTrash />
                              </button>
                            </div>
                            <input value={img.caption || ""} onChange={(e) => updateGalleryItem(index, imageIndex, { caption: e.target.value })} placeholder="ক্যাপশন" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "quote" && (
                  <div className="grid gap-3 md:grid-cols-[1fr_240px]">
                    <textarea value={block.data.text || ""} onChange={(e) => updateBlock(index, { text: e.target.value })} rows={3} placeholder="উক্তি লিখুন..." className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    <input value={block.data.source || ""} onChange={(e) => updateBlock(index, { source: e.target.value })} placeholder="উৎস/লেখক" className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                )}

                {block.type === "button" && (
                  <div className="grid gap-3 md:grid-cols-3">
                    <input value={block.data.text || ""} onChange={(e) => updateBlock(index, { text: e.target.value })} placeholder="বাটন টেক্সট" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    <input value={block.data.url || ""} onChange={(e) => updateBlock(index, { url: e.target.value })} placeholder="লিংক" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    <select value={block.data.align || "center"} onChange={(e) => updateBlock(index, { align: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="left">বামে</option>
                      <option value="center">মাঝখানে</option>
                      <option value="right">ডানে</option>
                    </select>
                  </div>
                )}

                {block.type === "note" && (
                  <div className="space-y-3">
                    <input value={block.data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} placeholder="নোট শিরোনাম" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    <textarea value={block.data.text || ""} onChange={(e) => updateBlock(index, { text: e.target.value })} rows={3} placeholder="নোট লিখুন..." className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  </div>
                )}

                {block.type === "video" && (
                  <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                    <input value={block.data.url || ""} onChange={(e) => updateBlock(index, { url: e.target.value })} placeholder="YouTube/embed URL" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    <input value={block.data.caption || ""} onChange={(e) => updateBlock(index, { caption: e.target.value })} placeholder="ক্যাপশন" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  </div>
                )}

                {block.type === "divider" && (
                  <select value={block.data.style || "line"} onChange={(e) => updateBlock(index, { style: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <option value="line">সাধারণ লাইন</option>
                    <option value="ornament">ডেকোরেটিভ লাইন</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
