"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaBookOpen, FaDownload, FaFilePdf, FaLanguage, FaSearch, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import { API_URL } from "@/lib/api";
import { BOOK_CATEGORIES, BOOK_LANGUAGES, BookListItem, mediaUrl } from "@/lib/books";

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export default function BooksArchivePage() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (language) params.set("language", language);
        if (search.trim()) params.set("search", search.trim());
        const url = `${API_URL}/books/list/${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as BookListItem[] | ApiList<BookListItem>;
          setBooks(listFromResponse(data));
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [category, language, search]);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero title="বই ও পিডিএফ লাইব্রেরি" subtitle="দ্বীনি বই, জীবনী, তাসাউফ, দোয়া ও শিক্ষামূলক PDF সংগ্রহ" showBismillah={false} />
      <Breadcrumbs items={[{ label: "বই ও পিডিএফ লাইব্রেরি" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="বই বা লেখক খুঁজুন..." />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল ক্যাটাগরি</option>
            {BOOK_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল ভাষা</option>
            {BOOK_LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <FaSpinner className="w-8 h-8 text-primary-500 mx-auto animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FaBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">কোনো বই পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="relative h-64 bg-gradient-to-br from-primary-50 to-gold-light/30">
                  {book.cover_image ? (
                    <Image src={mediaUrl(book.cover_image)} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaFilePdf className="w-16 h-16 text-primary-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 text-primary-700 border border-primary-100 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                      {book.category_display}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-gray-800 mb-2 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">{book.title}</h3>
                  {book.author && <p className="text-xs font-semibold text-primary-700 mb-2">{book.author}</p>}
                  {book.short_description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{book.short_description}</p>}
                  <div className="space-y-2 text-xs text-gray-500 mt-auto">
                    <div className="flex items-center gap-2">
                      <FaLanguage className="w-3.5 h-3.5 text-primary-500" />
                      <span>{book.language_display}{book.pages ? ` · ${book.pages} পৃষ্ঠা` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaDownload className="w-3.5 h-3.5 text-primary-500" />
                      <span>{book.download_count} ডাউনলোড</span>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-600">পড়ুন</span>
                    <FaArrowRight className="w-3 h-3 text-primary-500 group-hover:translate-x-1 transition-transform" />
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
