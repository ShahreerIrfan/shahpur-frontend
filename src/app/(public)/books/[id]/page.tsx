"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaBookOpen, FaDownload, FaEye, FaFilePdf, FaLanguage, FaSpinner } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
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

  const handleDownload = async () => {
    if (!book) return;
    await fetch(`${API_URL}/books/list/${book.id}/download/`, { method: "POST" }).catch(() => null);
    window.open(mediaUrl(book.pdf_file), "_blank", "noopener,noreferrer");
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
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-light/40 py-12 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-80 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <Link href="/books" className="inline-flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-6 bg-white/85 hover:bg-white px-4 py-2 rounded-full border border-primary-100 shadow-sm">
            <FaArrowLeft className="w-3 h-3" /> লাইব্রেরিতে ফিরে যান
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
            <div className="relative h-80 bg-white rounded-2xl border border-primary-100 shadow-lg overflow-hidden">
              {book.cover_image ? (
                <Image src={mediaUrl(book.cover_image)} alt={book.title} fill className="object-cover" unoptimized priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-50">
                  <FaFilePdf className="w-20 h-20 text-primary-300" />
                </div>
              )}
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
                <div className="bg-white/80 border border-primary-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">লেখক</p>
                  <p className="font-bold text-gray-800">{book.author || "উল্লেখ নেই"}</p>
                </div>
                <div className="bg-white/80 border border-primary-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">পৃষ্ঠা</p>
                  <p className="font-bold text-gray-800">{book.pages || "উল্লেখ নেই"}</p>
                </div>
                <div className="bg-white/80 border border-primary-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">পাঠ / ডাউনলোড</p>
                  <p className="font-bold text-gray-800">{book.view_count} / {book.download_count}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={handleDownload} className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                  <FaDownload className="w-3.5 h-3.5" /> PDF খুলুন / ডাউনলোড
                </button>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-primary-50 text-primary-700 border border-primary-100 px-5 py-3 rounded-xl text-sm font-bold transition-colors">
                  <FaFilePdf className="w-3.5 h-3.5" /> নতুন ট্যাবে পড়ুন
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: "বই ও পিডিএফ লাইব্রেরি", url: "/books" }, { label: book.title }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-8">
          <div className="space-y-6">
            {book.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">বই পরিচিতি</h2>
                <p className="text-gray-650 leading-loose whitespace-pre-line text-justify">{book.description}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">PDF রিডার</h2>
                  <p className="text-xs text-gray-400 mt-1">বইটি সরাসরি ব্রাউজারে পড়ুন</p>
                </div>
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors">
                  ফুলস্ক্রিন
                </a>
              </div>
              <iframe src={`${pdfUrl}#toolbar=1&navpanes=0`} title={book.title} className="w-full h-[720px] bg-gray-100" />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="inline-flex items-center gap-2 text-gray-500"><FaEye className="w-3.5 h-3.5" /> পাঠ</span>
                  <span className="font-bold text-gray-800">{book.view_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-gray-500"><FaDownload className="w-3.5 h-3.5" /> ডাউনলোড</span>
                  <span className="font-bold text-gray-800">{book.download_count}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
