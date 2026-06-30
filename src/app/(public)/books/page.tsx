"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaBookOpen, FaDownload, FaFilePdf, FaLanguage, FaSearch, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHero from "@/components/ui/PageHero";
import Pagination from "@/components/ui/Pagination";
import { API_URL } from "@/lib/api";
import { BOOK_LANGUAGES, BookCategory, BookListItem, mediaUrl } from "@/lib/books";

interface ApiList<T> {
  results?: T[];
  count?: number;
}

export default function BooksArchivePage() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<BookCategory[]>([]);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => {
    const loadTaxonomies = async () => {
      const res = await fetch(`${API_URL}/books/categories/`);
      if (res.ok) {
        const data = (await res.json()) as BookCategory[] | ApiList<BookCategory>;
        const list = Array.isArray(data) ? data : data.results || [];
        setCategories(list);
      }
    };
    void loadTaxonomies();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (category) params.set("category", category);
        if (language) params.set("language", language);
        if (search.trim()) params.set("search", search.trim());
        const url = `${API_URL}/books/list/${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as BookListItem[] | ApiList<BookListItem>;
          if (Array.isArray(data)) {
            setBooks(data);
            setCount(data.length);
          } else {
            setBooks(data.results || []);
            setCount(data.count || 0);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void load();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [category, language, search, page]);

  const handleFilterChange = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    setPage(1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const paddedBooks = [...books];
  if (paddedBooks.length > 0) {
    const remainder = paddedBooks.length % 12;
    const padCount = remainder === 0 ? 0 : 12 - remainder;
    for (let i = 0; i < padCount; i++) {
      paddedBooks.push({
        id: `empty-shelf-${i}`,
        title: "",
      } as any);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <PageHero title="বই ও পিডিএফ লাইব্রেরি" subtitle="দ্বীনি বই, জীবনী, তাসাউফ, দোয়া ও শিক্ষামূলক PDF সংগ্রহ" showBismillah={false} />
      <Breadcrumbs items={[{ label: "বই ও পিডিএফ লাইব্রেরি" }]} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => handleFilterChange(setSearch)(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="বই বা লেখক খুঁজুন..." />
          </div>
          <select value={category} onChange={(e) => handleFilterChange(setCategory)(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
            <option value="">সকল ক্যাটাগরি</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={language} onChange={(e) => handleFilterChange(setLanguage)(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50">
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
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <p className="text-gray-700 font-bold text-sm bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                মোট বই: <span className="text-primary-700 font-extrabold">{count}</span> টি
              </p>
            </div>

            <div className="bg-[#140b05] border-[12px] md:border-[20px] border-[#382315] rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.85),_inset_0_4px_20px_rgba(0,0,0,0.6)] p-0.5 relative overflow-hidden">
              {/* Vertical wood sides/pillars visual effect */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#25150c] shadow-[inset_-1px_0_3px_rgba(0,0,0,0.8)] z-30"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#25150c] shadow-[inset_1px_0_3px_rgba(0,0,0,0.8)] z-30"></div>
              
              {/* Shelf inner background */}
              <div className="bg-[#1c120c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1b11] via-[#150d08] to-[#0d0704] p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-0 gap-y-16">
                  {paddedBooks.map((book) => {
                    const isEmptyShelf = book.id.toString().startsWith("empty-shelf");
                    
                    if (isEmptyShelf) {
                      return (
                        <div key={book.id} className="flex flex-col justify-end items-center h-full relative pointer-events-none select-none">
                          {/* Empty shelf space above */}
                          <div className="px-3 md:px-5 pb-0 flex flex-col items-center justify-end relative h-full w-full min-h-[160px] md:min-h-[210px]">
                            {/* Empty space */}
                          </div>

                          {/* Shelf Top Face */}
                          <div className="w-full h-4 bg-gradient-to-r from-[#442c1e] via-[#563826] to-[#442c1e] border-t border-[#ffffff15] relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),_0_2px_4px_rgba(0,0,0,0.5)]"></div>

                          {/* Shelf Front Face */}
                          <div className="w-full px-2 py-4 bg-gradient-to-b from-[#2e1d13] to-[#1e130c] border-t border-[#603e29] shadow-[0_8px_16px_rgba(0,0,0,0.6)] min-h-[140px] relative z-10">
                            {/* Drop shadow overlay cast to the shelf below */}
                            <div className="absolute left-0 right-0 top-full h-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-0"></div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link key={book.id} href={`/books/${book.id}`} className="group flex flex-col justify-end items-center h-full relative">
                        
                        {/* Upright Standing Book Cover */}
                        <div className="px-3 md:px-5 pb-0 flex flex-col items-center justify-end relative h-full w-full">
                          <div className="relative w-[110px] h-[160px] md:w-[145px] md:h-[210px] transition-all duration-300 group-hover:-translate-y-3.5 group-hover:scale-102 flex-shrink-0 mb-[-1px] rounded-r-xl rounded-l-md overflow-hidden shadow-[8px_8px_20px_rgba(0,0,0,0.65),_-1px_0_4px_rgba(255,255,255,0.15)_inset] bg-[#2d1b10] border-y border-r border-[#ffffff15]">
                            {book.cover_image ? (
                              <Image
                                src={mediaUrl(book.cover_image)}
                                alt={book.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#4d3222] to-[#241710]">
                                <FaFilePdf className="w-10 h-10 md:w-14 md:h-14 text-yellow-500/60 mb-2" />
                                <span className="text-[10px] md:text-xs text-white/70 font-bold line-clamp-2 px-1">{book.title}</span>
                              </div>
                            )}
                            {/* Book spine line overlay for 3D realism */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/45 via-white/10 to-transparent z-10 rounded-l-md"></div>
                            {/* Gloss overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-10 pointer-events-none"></div>
                          </div>
                        </div>

                        {/* Shelf Top Face */}
                        <div className="w-full h-4 bg-gradient-to-r from-[#442c1e] via-[#563826] to-[#442c1e] border-t border-[#ffffff15] relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),_0_2px_4px_rgba(0,0,0,0.5)]"></div>

                        {/* Shelf Front Face & Details */}
                        <div className="w-full px-2 py-4 bg-gradient-to-b from-[#2e1d13] to-[#1e130c] border-t border-[#603e29] text-center shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex flex-col justify-between min-h-[140px] relative z-10">
                          <div className="space-y-1">
                            <h3 className="font-bold text-white text-xs md:text-sm leading-snug group-hover:text-yellow-400 transition-colors line-clamp-2 px-1">
                              {book.title}
                            </h3>
                            {book.author_name && (
                              <p className="text-[10px] md:text-xs font-semibold text-[#c0b0a5] line-clamp-1">
                                {book.author_name}
                              </p>
                            )}
                          </div>
                          <div className="mt-3">
                            <span className="inline-block px-3.5 py-1 text-[10px] md:text-xs font-bold text-white/90 border border-white/20 hover:border-white/50 hover:bg-white/5 rounded transition-all">
                              বিস্তারিত দেখুন
                            </span>
                          </div>
                          
                          {/* Drop shadow overlay cast to the shelf below */}
                          <div className="absolute left-0 right-0 top-full h-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-0"></div>
                        </div>

                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 mt-8">
                <p className="text-sm text-gray-500">মোট {count}টি বই · পৃষ্ঠা {page} / {totalPages}</p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
