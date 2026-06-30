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

            <div className="w-full bg-[#faf8f4] bg-[linear-gradient(rgba(0,0,0,0.015)_1px,_transparent_1px)] bg-[size:100%_24px] border-[12px] md:border-[16px] border-[#cbbcae] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),_inset_0_4px_15px_rgba(0,0,0,0.1)] relative overflow-hidden p-1">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-0 gap-y-0">
                {paddedBooks.map((book) => {
                  const isEmptyShelf = book.id.toString().startsWith("empty-shelf");
                  
                  if (isEmptyShelf) {
                    return (
                      <div key={book.id} className="flex flex-col justify-end items-center h-full relative pointer-events-none select-none">
                        {/* Empty space above */}
                        <div className="px-3 md:px-5 pb-0 flex flex-col items-center justify-end relative h-full w-full min-h-[160px] md:min-h-[200px]"></div>
                        
                        {/* Shelf Top Face */}
                        <div className="w-full h-3.5 bg-gradient-to-r from-[#e3d2c3] via-[#eedfd0] to-[#e3d2c3] border-t border-white/50 relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"></div>
                        
                        {/* Shelf Front Face */}
                        <div className="w-full bg-gradient-to-b from-[#bdab9b] to-[#a39282] border-t border-[#dfd1c5] min-h-[135px] relative z-10 shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                          <div className="absolute left-0 right-0 top-full h-5 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-0"></div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link key={book.id} href={`/books/${book.id}`} className="group flex flex-col justify-end items-center h-full relative hover:z-20">
                      
                      {/* Upright Standing Book Cover */}
                      <div className="px-3 md:px-5 pt-8 pb-3 flex flex-col items-center justify-end relative h-full w-full min-h-[160px] md:min-h-[200px]">
                        <div className="relative w-[90px] h-[130px] md:w-[115px] md:h-[165px] transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-103 flex-shrink-0 mb-[-1px] rounded-r-lg rounded-l-sm overflow-hidden shadow-[6px_6px_15px_rgba(0,0,0,0.25),_-1px_0_3px_rgba(255,255,255,0.15)_inset] bg-[#2d1b10] border-y border-r border-[#ffffff15]">
                          {book.cover_image ? (
                            <Image
                              src={mediaUrl(book.cover_image)}
                              alt={book.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-primary-900 to-primary-950">
                              <FaFilePdf className="w-8 h-8 text-gold-light/60 mb-2" />
                              <span className="text-[9px] md:text-[10px] text-white/70 font-bold line-clamp-2 px-1">{book.title}</span>
                            </div>
                          )}
                          {/* Book spine line overlay for 3D realism */}
                          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 via-white/15 to-transparent z-10 rounded-l-sm"></div>
                          {/* Gloss overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-10 pointer-events-none"></div>
                        </div>
                      </div>

                      {/* Shelf Top Face */}
                      <div className="w-full h-3.5 bg-gradient-to-r from-[#e3d2c3] via-[#eedfd0] to-[#e3d2c3] border-t border-white/50 relative z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_1px_2px_rgba(0,0,0,0.05)]"></div>

                      {/* Shelf Front Face & Details */}
                      <div className="w-full px-2 py-4 bg-gradient-to-b from-[#bdab9b] to-[#a39282] border-t border-[#dfd1c5] text-center flex flex-col justify-between min-h-[135px] relative z-10 shadow-[0_8px_16px_rgba(0,0,0,0.08)]">
                        <div className="space-y-1">
                          <h3 className="font-bold text-[#034838] text-xs md:text-sm leading-snug group-hover:text-primary-650 transition-colors line-clamp-2 px-1">
                            {book.title}
                          </h3>
                          {book.author_name && (
                            <p className="text-[10px] md:text-xs font-semibold text-gray-700 line-clamp-1">
                              {book.author_name}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 text-[10px] md:text-xs font-bold text-[#034838] border border-[#034838]/25 hover:border-[#034838] hover:bg-[#034838]/5 rounded transition-all">
                            বিস্তারিত দেখুন
                          </span>
                        </div>
                        <div className="absolute left-0 right-0 top-full h-5 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-0"></div>
                      </div>

                    </Link>
                  );
                })}
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