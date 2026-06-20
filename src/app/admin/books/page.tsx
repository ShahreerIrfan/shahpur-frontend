"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaDownload, FaEdit, FaEye, FaFilePdf, FaPlus, FaSearch, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { BookListItem, mediaUrl } from "@/lib/books";

interface ApiList<T> {
  results?: T[];
  count?: number;
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchBooks = useCallback(async () => {
    try {
      const res = await authFetch("/books/list/");
      if (!res.ok) {
        throw new Error("বই তালিকা লোড করতে সমস্যা হয়েছে।");
      }
      const data = (await res.json()) as BookListItem[] | ApiList<BookListItem>;
      setBooks(listFromResponse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBooks();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchBooks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/books/list/${deleteId}/`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setBooks((prev) => prev.filter((book) => book.id !== deleteId));
        setDeleteId(null);
      } else {
        throw new Error("বই মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "বই মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author_name.toLowerCase().includes(search.toLowerCase()) ||
    book.category_display.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">বই / পিডিএফ লাইব্রেরি</h1>
          <p className="text-sm text-gray-500 mt-1">ইসলামিক বই, PDF, লেখক ও প্রকাশনা তথ্য পরিচালনা করুন</p>
        </div>
        <Link href="/admin/books/create" className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto">
          <FaPlus className="w-3 h-3" />
          নতুন বই
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="বই, লেখক বা ক্যাটাগরি খুঁজুন..." />
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
          <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500 text-sm">তথ্য লোড হচ্ছে...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FaBookOpen className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো বই যোগ করা হয়নি</h3>
          <p className="text-gray-500 text-sm mb-6">প্রথম বই বা পিডিএফ লাইব্রেরিতে যোগ করুন।</p>
          <Link href="/admin/books/create" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
            <FaPlus className="w-3 h-3" />
            বই যোগ করুন
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">বই</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্যাটাগরি</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ভাষা</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">পাঠ / ডাউনলোড</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">প্রকাশনা</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{book.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{book.author_name || "লেখক দেয়া হয়নি"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded-lg">{book.category_display}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{book.language_display}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1"><FaEye className="w-3 h-3" /> {book.view_count}</span>
                        <span className="inline-flex items-center gap-1"><FaDownload className="w-3 h-3" /> {book.download_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${book.is_published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {book.is_published ? "প্রকাশিত" : "ড্রাফট"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/books/${book.id}`} target="_blank" className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition-colors" title="প্রিভিউ">
                          <FaEye className="w-3 h-3" />
                        </Link>
                        <a href={mediaUrl(book.pdf_file)} target="_blank" rel="noreferrer" className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors" title="PDF">
                          <FaFilePdf className="w-3 h-3" />
                        </a>
                        <Link href={`/admin/books/edit/${book.id}`} className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors" title="এডিট">
                          <FaEdit className="w-3 h-3" />
                        </Link>
                        <button onClick={() => setDeleteId(book.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">মোট {filteredBooks.length}টি বই</p>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">বই মুছে ফেলুন</h3>
            <p className="text-sm text-gray-500 mb-6">আপনি কি নিশ্চিত যে এই বইটি মুছে ফেলতে চান?</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">বাতিল</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors">
                {deleting ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
