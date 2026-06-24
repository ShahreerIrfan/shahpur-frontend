"use client";

import React, { useState } from "react";
import { 
  FaArrowDown, 
  FaArrowUp, 
  FaTrash, 
  FaHeading, 
  FaParagraph, 
  FaImage, 
  FaImages, 
  FaQuoteLeft, 
  FaVideo, 
  FaLink, 
  FaStickyNote, 
  FaCode, 
  FaUpload, 
  FaSpinner,
  FaPlus
} from "react-icons/fa";
import { authFetch } from "@/lib/api";

export interface BlogBlock {
  type: string;
  data: any;
}

interface BlogBlockEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

export default function BlogBlockEditor({ blocks, onChange }: BlogBlockEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [galleryUploadIndex, setGalleryUploadIndex] = useState<{ blockIndex: number; imageIndex: number } | null>(null);

  const addBlock = (type: string) => {
    let defaultData = {};
    switch (type) {
      case "heading":
        defaultData = { level: 2, text: "" };
        break;
      case "paragraph":
        defaultData = { text: "" };
        break;
      case "image":
        defaultData = { url: "", alt: "", caption: "" };
        break;
      case "gallery":
        defaultData = { images: [] }; // array of { url: "", alt: "", caption: "" }
        break;
      case "quote":
        defaultData = { text: "", source: "" };
        break;
      case "video":
        defaultData = { url: "", caption: "" };
        break;
      case "button":
        defaultData = { text: "", url: "", alignment: "center" };
        break;
      case "note":
        defaultData = { title: "", text: "", isIslamic: true };
        break;
      case "html":
        defaultData = { code: "" };
        break;
    }
    onChange([...blocks, { type, data: defaultData }]);
  };

  const removeBlock = (index: number) => {
    const updated = [...blocks];
    updated.splice(index, 1);
    onChange(updated);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const updateBlockData = (index: number, key: string, value: any) => {
    const updated = [...blocks];
    updated[index] = {
      ...updated[index],
      data: {
        ...updated[index].data,
        [key]: value,
      },
    };
    onChange(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
      e.target.value = "";
      return;
    }

    setUploadingIndex(blockIndex);
    const body = new FormData();
    body.append("image", file);

    try {
      const res = await authFetch("/blog/upload/", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const data = await res.json();
        updateBlockData(blockIndex, "url", data.path); // store relative path or URL
      } else {
        alert("ইমেজ আপলোড করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে কানেক্ট করতে সমস্যা হয়েছে।");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    blockIndex: number,
    imageIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইলের আকার ৫ মেগাবাইটের বেশি হতে পারবে না।");
      e.target.value = "";
      return;
    }

    setGalleryUploadIndex({ blockIndex, imageIndex });
    const body = new FormData();
    body.append("image", file);

    try {
      const res = await authFetch("/blog/upload/", {
        method: "POST",
        body,
      });
      if (res.ok) {
        const data = await res.json();
        const block = blocks[blockIndex];
        const images = [...(block.data.images || [])];
        images[imageIndex] = {
          ...images[imageIndex],
          url: data.path,
        };
        updateBlockData(blockIndex, "images", images);
      } else {
        alert("ইমেজ আপলোড করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে কানেক্ট করতে সমস্যা হয়েছে।");
    } finally {
      setGalleryUploadIndex(null);
    }
  };

  const addGalleryImage = (blockIndex: number) => {
    const block = blocks[blockIndex];
    const images = [...(block.data.images || [])];
    images.push({ url: "", alt: "", caption: "" });
    updateBlockData(blockIndex, "images", images);
  };

  const removeGalleryImage = (blockIndex: number, imageIndex: number) => {
    const block = blocks[blockIndex];
    const images = [...(block.data.images || [])];
    images.splice(imageIndex, 1);
    updateBlockData(blockIndex, "images", images);
  };

  const updateGalleryImageData = (
    blockIndex: number,
    imageIndex: number,
    key: string,
    value: any
  ) => {
    const block = blocks[blockIndex];
    const images = [...(block.data.images || [])];
    images[imageIndex] = {
      ...images[imageIndex],
      [key]: value,
    };
    updateBlockData(blockIndex, "images", images);
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-100 bg-gray-50/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">কনটেন্ট ব্লক যোগ করুন:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => addBlock("paragraph")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaParagraph className="w-3.5 h-3.5 text-primary-500" />
            প্যারাগ্রাফ / টেক্সট
          </button>
          <button
            type="button"
            onClick={() => addBlock("heading")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaHeading className="w-3.5 h-3.5 text-indigo-500" />
            হেডিং (শিরোনাম)
          </button>
          <button
            type="button"
            onClick={() => addBlock("image")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaImage className="w-3.5 h-3.5 text-emerald-500" />
            একক ছবি
          </button>
          <button
            type="button"
            onClick={() => addBlock("gallery")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaImages className="w-3.5 h-3.5 text-teal-500" />
            ছবি গ্যালারি
          </button>
          <button
            type="button"
            onClick={() => addBlock("quote")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaQuoteLeft className="w-3.5 h-3.5 text-amber-500" />
            উক্তি / বাণী
          </button>
          <button
            type="button"
            onClick={() => addBlock("video")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaVideo className="w-3.5 h-3.5 text-red-500" />
            ভিডিও এম্বেড
          </button>
          <button
            type="button"
            onClick={() => addBlock("button")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaLink className="w-3.5 h-3.5 text-blue-500" />
            বাটন / লিংক
          </button>
          <button
            type="button"
            onClick={() => addBlock("note")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaStickyNote className="w-3.5 h-3.5 text-pink-500" />
            ইসলামিক নোট / কার্ড
          </button>
          <button
            type="button"
            onClick={() => addBlock("html")}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-gray-700 transition"
          >
            <FaCode className="w-3.5 h-3.5 text-gray-500" />
            কাস্টম HTML
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
            এখনো কোনো ব্লক যোগ করা হয়নি। উপরের অপশনগুলো থেকে ব্লগ ডিজাইন শুরু করুন।
          </div>
        ) : (
          blocks.map((block, index) => {
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Block Header */}
                <div className="bg-gray-50/70 border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-0.5 bg-gray-200/60 rounded">
                      {block.type}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">#ব্লক {index + 1}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, "up")}
                      className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="উপরে সরান"
                    >
                      <FaArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                      className="p-1 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                      title="নিচে সরান"
                    >
                      <FaArrowDown className="w-3 h-3" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="ব্লকটি মুছুন"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Body Editor fields */}
                <div className="p-4">
                  {block.type === "paragraph" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">প্যারাগ্রাফের লেখা</label>
                      <textarea
                        rows={4}
                        placeholder="ব্লগ কনটেন্ট লিখুন..."
                        value={block.data.text || ""}
                        onChange={(e) => updateBlockData(index, "text", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}

                  {block.type === "heading" && (
                    <div className="flex gap-3">
                      <div className="w-24">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ধাপ (Level)</label>
                        <select
                          value={block.data.level || 2}
                          onChange={(e) => updateBlockData(index, "level", parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        >
                          <option value={2}>H2 (বড়)</option>
                          <option value={3}>H3 (মাঝারি)</option>
                          <option value={4}>H4 (ছোট)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">হেডিং এর লেখা</label>
                        <input
                          type="text"
                          placeholder="শিরোনাম লিখুন..."
                          value={block.data.text || ""}
                          onChange={(e) => updateBlockData(index, "text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ছবির URL</label>
                          <input
                            type="text"
                            placeholder="ইমেজ ফাইল আপলোড করুন অথবা সরাসরি লিংক দিন"
                            value={block.data.url || ""}
                            onChange={(e) => updateBlockData(index, "url", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="md:w-36 flex flex-col justify-end">
                          <label className="relative flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-xl text-xs cursor-pointer transition h-[38px] border border-gray-200">
                            {uploadingIndex === index ? (
                              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                            )}
                            আপলোড ইমেজ
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, index)}
                              disabled={uploadingIndex !== null}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">অল্টার টেক্সট (Alt Text)</label>
                          <input
                            type="text"
                            placeholder="ছবির বর্ণনা (SEO এর জন্য উপকারী)"
                            value={block.data.alt || ""}
                            onChange={(e) => updateBlockData(index, "alt", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ক্যাপশন (Caption)</label>
                          <input
                            type="text"
                            placeholder="ছবির নিচে দেখানোর ক্যাপশন"
                            value={block.data.caption || ""}
                            onChange={(e) => updateBlockData(index, "caption", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === "gallery" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-500">গ্যালারি ইমেজসমূহ</label>
                        <button
                          type="button"
                          onClick={() => addGalleryImage(index)}
                          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 transition"
                        >
                          <FaPlus className="w-2.5 h-2.5" />
                          নতুন ইমেজ যোগ
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(block.data.images || []).map((img: any, imgIdx: number) => (
                          <div 
                            key={imgIdx} 
                            className="p-3 border border-gray-100 bg-gray-50/50 rounded-xl space-y-2.5 relative group/img"
                          >
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index, imgIdx)}
                              className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded transition opacity-0 group-hover/img:opacity-100"
                              title="ইমেজটি সরান"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>

                            <div className="flex flex-col md:flex-row gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="ইমেজ URL"
                                  value={img.url || ""}
                                  onChange={(e) => updateGalleryImageData(index, imgIdx, "url", e.target.value)}
                                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                />
                              </div>
                              <div className="md:w-32 flex flex-col justify-end">
                                <label className="relative flex items-center justify-center gap-1 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-1.5 px-2 rounded-lg text-xs cursor-pointer border border-gray-200 transition h-[32px]">
                                  {galleryUploadIndex?.blockIndex === index && galleryUploadIndex?.imageIndex === imgIdx ? (
                                    <FaSpinner className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <FaUpload className="w-3 h-3 text-gray-400" />
                                  )}
                                  আপলোড
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleGalleryImageUpload(e, index, imgIdx)}
                                    disabled={galleryUploadIndex !== null}
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="অল্টার টেক্সট"
                                value={img.alt || ""}
                                onChange={(e) => updateGalleryImageData(index, imgIdx, "alt", e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                              />
                              <input
                                type="text"
                                placeholder="ক্যাপশন"
                                value={img.caption || ""}
                                onChange={(e) => updateGalleryImageData(index, imgIdx, "caption", e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">উক্তি বা বাণী</label>
                        <textarea
                          rows={2}
                          placeholder="উক্তিটি লিখুন..."
                          value={block.data.text || ""}
                          onChange={(e) => updateBlockData(index, "text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">উৎস বা বক্তা (Source)</label>
                        <input
                          type="text"
                          placeholder="উদা: বুখারী শরিফ বা আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ)"
                          value={block.data.source || ""}
                          onChange={(e) => updateBlockData(index, "source", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "video" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ভিডিও লিংক (YouTube বা Embed URL)</label>
                        <input
                          type="text"
                          placeholder="উদা: https://www.youtube.com/embed/..."
                          value={block.data.url || ""}
                          onChange={(e) => updateBlockData(index, "url", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ক্যাপশন</label>
                        <input
                          type="text"
                          placeholder="ভিডিওর নিচে দেখানোর সংক্ষিপ্ত ক্যাপশন"
                          value={block.data.caption || ""}
                          onChange={(e) => updateBlockData(index, "caption", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "button" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">বাটন টেক্সট</label>
                        <input
                          type="text"
                          placeholder="উদা: বিস্তারিত পড়ুন"
                          value={block.data.text || ""}
                          onChange={(e) => updateBlockData(index, "text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">লিংক (URL)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={block.data.url || ""}
                          onChange={(e) => updateBlockData(index, "url", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">অ্যালাইনমেন্ট</label>
                        <select
                          value={block.data.alignment || "center"}
                          onChange={(e) => updateBlockData(index, "alignment", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                        >
                          <option value="left">বাম (Left)</option>
                          <option value="center">মাঝখান (Center)</option>
                          <option value="right">ডান (Right)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {block.type === "note" && (
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">কার্ড টাইটেল (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            placeholder="উদা: একটি গুরুত্বপূর্ণ হাদীস বা বিশেষ দ্রষ্টব্য"
                            value={block.data.title || ""}
                            onChange={(e) => updateBlockData(index, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 md:pt-4">
                          <input
                            type="checkbox"
                            id={`note-islamic-${index}`}
                            checked={block.data.isIslamic ?? true}
                            onChange={(e) => updateBlockData(index, "isIslamic", e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label htmlFor={`note-islamic-${index}`} className="text-xs text-gray-600 font-semibold cursor-pointer select-none">
                            ইসলামিক থিম (সবুজ ও গোল্ডেন)
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">কার্ড টেক্সট / নোট কনটেন্ট</label>
                        <textarea
                          rows={3}
                          placeholder="কার্ডের ভেতরে প্রদর্শনের লেখা লিখুন..."
                          value={block.data.text || ""}
                          onChange={(e) => updateBlockData(index, "text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "html" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">কাস্টম HTML কোড</label>
                      <textarea
                        rows={6}
                        placeholder="<div>...</div> বা<iframe>...</iframe> কোড লিখুন"
                        value={block.data.code || ""}
                        onChange={(e) => updateBlockData(index, "code", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
