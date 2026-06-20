"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaBookOpen, FaCalendarAlt, FaDownload, FaEye, FaFeatherAlt, FaFilePdf, FaLanguage, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PdfBookReader from "@/components/books/PdfBookReader";
import { API_URL } from "@/lib/api";
import { BookDetail, mediaUrl } from "@/lib/books";

export default function BookDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/books/list/${id}/`);
        if (res.ok) {
          const data = (await res.json()) as BookDetail;
          setBook(data);
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const registerDownload = async () => {
    if (!book) return;
    const res = await fetch(`${API_URL}/books/list/${book.id}/download/`, { method: "POST" }).catch(() => null);
    if (res?.ok) {
      const data = (await res.json().catch(() => null)) as { download_count?: number } | null;
      setBook((current) => current ? { ...current, download_count: data?.download_count ?? current.download_count + 1 } : current);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaBookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">বইটি পাওয়া যায়নি</p>
          <Link href="/books" className="inline-block mt-4 text-primary-600 text-sm font-semibold">লাইব্রেরিতে ফিরে যান</Link>
        </div>
      </div>
    );
  }

  const pdfUrl = mediaUrl(book.pdf_file);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-light/40 py-14 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-80 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/books" className="inline-flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-6 bg-white/85 hover:bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
            <FaArrowLeft className="w-3 h-3" /> লাইব্রেরিতে ফিরে যান
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-start">
            <div className="relative">
              <div className="absolute -bottom-5 left-8 right-8 h-8 bg-primary-950/20 blur-2xl rounded-full"></div>
              <div className="relative h-[430px] bg-white rounded-[28px] border border-primary-100 shadow-2xl overflow-hidden rotate-[-1deg]">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/12 to-transparent z-10 pointer-events-none"></div>
                {book.cover_image ? (
                  <Image src={mediaUrl(book.cover_image)} alt={book.title} fill className="object-cover" unoptimized priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50">
                    <FaFilePdf className="w-20 h-20 text-primary-300" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">{book.category_display}</span>
                <span className="bg-white text-primary-700 border border-primary-100 px-3 py-1 rounded-full text-xs font-bold">{book.language_display}</span>
                {book.publication_year && <span className="bg-gold-light/80 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{book.publication_year}</span>}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary-950 leading-tight mb-5">{book.title}</h1>
              {book.short_description && <p className="text-primary-900/80 text-base md:text-lg leading-relaxed max-w-3xl mb-6">{book.short_description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/85 backdrop-blur border border-primary-100 rounded-2xl px-4 py-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaFeatherAlt className="w-3 h-3" /> লেখক</p>
                  <p className="font-bold text-gray-800">{book.author_name || "উল্লেখ নেই"}</p>
                </div>
                <div className="bg-white/85 backdrop-blur border border-primary-100 rounded-2xl px-4 py-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">পৃষ্ঠা</p>
                  <p className="font-bold text-gray-800">{book.pages || "উল্লেখ নেই"}</p>
                </div>
                <div className="bg-white/85 backdrop-blur border border-primary-100 rounded-2xl px-4 py-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaCalendarAlt className="w-3 h-3" /> প্রকাশের বছর</p>
                  <p className="font-bold text-gray-800">{book.publication_year || "উল্লেখ নেই"}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <a href="#book-reader" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                  <FaBookOpen className="w-3.5 h-3.5" /> বই রিডারে পড়ুন
                </a>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900/70 bg-white/75 border border-primary-100 px-4 py-3 rounded-xl">
                  <FaEye className="w-3.5 h-3.5" /> {book.view_count} পাঠ
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900/70 bg-white/75 border border-primary-100 px-4 py-3 rounded-xl">
                  <FaDownload className="w-3.5 h-3.5" /> {book.download_count} ডাউনলোড
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: "বই ও পিডিএফ লাইব্রেরি", url: "/books" }, { label: book.title }]} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {book.description && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">বই পরিচিতি</h2>
                <p className="text-gray-700 leading-loose whitespace-pre-line text-justify">{book.description}</p>
              </div>
              <div className="bg-primary-50/60 rounded-2xl border border-primary-100 p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4">বইয়ের তথ্য</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <FaBookOpen className="w-4 h-4 text-primary-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">ক্যাটাগরি</p>
                      <p className="font-semibold text-gray-800">{book.category_display}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <FaLanguage className="w-4 h-4 text-primary-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">ভাষা</p>
                      <p className="font-semibold text-gray-800">{book.language_display}</p>
                    </div>
                  </div>
                  {book.translator && (
                    <div>
                      <p className="text-xs text-gray-400">অনুবাদক</p>
                      <p className="font-semibold text-gray-800">{book.translator}</p>
                    </div>
                  )}
                  {book.publisher && (
                    <div>
                      <p className="text-xs text-gray-400">প্রকাশক</p>
                      <p className="font-semibold text-gray-800">{book.publisher}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-primary-100 pt-4">
                    <span className="inline-flex items-center gap-2 text-gray-500"><FaEye className="w-3.5 h-3.5" /> পাঠ</span>
                    <span className="font-bold text-gray-800">{book.view_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-gray-500"><FaDownload className="w-3.5 h-3.5" /> ডাউনলোড</span>
                    <span className="font-bold text-gray-800">{book.download_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[30px] bg-primary-950 text-white p-6 md:p-8 shadow-xl">
          <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-primary-200 text-xs font-bold uppercase tracking-[0.2em] mb-2">Reading Room</p>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">নিজস্ব বই রিডারে পড়ুন</h2>
              <p className="text-white/75 max-w-2xl leading-relaxed">
                বইয়ের মতো পৃষ্ঠা উল্টানো, ডাবল পেজ ভিউ, লাইট/সেপিয়া/ডার্ক মোড, জুম এবং ডাউনলোড সবকিছু এক জায়গায় রাখা হয়েছে।
              </p>
            </div>
            <a href="#book-reader" className="inline-flex items-center justify-center gap-2 bg-white text-primary-800 hover:bg-primary-50 px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
              <FaBookOpen className="w-3.5 h-3.5" /> রিডার চালু করুন
            </a>
          </div>
        </div>

        <PdfBookReader pdfUrl={pdfUrl} title={book.title} onDownload={registerDownload} />
      </div>
    </div>
  );
}
