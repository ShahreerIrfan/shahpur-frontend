"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaArrowLeft, FaBookOpen, FaFilePdf, FaImage, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { BOOK_LANGUAGES, BookAuthor, BookCategory, BookDetail, mediaUrl } from "@/lib/books";

interface BookFormProps {
  bookId?: string;
}

interface ApiList<T> {
  results?: T[];
}

function listFromResponse<T>(data: T[] | ApiList<T>): T[] {
  return Array.isArray(data) ? data : data.results || [];
}

export default function BookForm({ bookId }: BookFormProps) {
  const router = useRouter();
  const isEdit = Boolean(bookId);
  const [loading, setLoading] = useState(Boolean(bookId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [book, setBook] = useState<BookDetail | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [authors, setAuthors] = useState<BookAuthor[]>([]);

  const fetchTaxonomies = useCallback(async () => {
    const [categoryRes, authorRes] = await Promise.all([
      authFetch("/books/categories/"),
      authFetch("/books/authors/"),
    ]);
    if (categoryRes.ok) {
      const data = (await categoryRes.json()) as BookCategory[] | ApiList<BookCategory>;
      setCategories(listFromResponse(data));
    }
    if (authorRes.ok) {
      const data = (await authorRes.json()) as BookAuthor[] | ApiList<BookAuthor>;
      setAuthors(listFromResponse(data));
    }
  }, []);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    const res = await authFetch(`/books/list/${bookId}/`);
    if (!res.ok) {
      throw new Error("বইয়ের তথ্য লোড করতে সমস্যা হয়েছে।");
    }
    const data = (await res.json()) as BookDetail;
    setBook(data);
    if (data.cover_image) {
      setCoverPreview(mediaUrl(data.cover_image));
    }
  }, [bookId]);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTaxonomies();
        await fetchBook();
      } catch (err) {
        setError(err instanceof Error ? err.message : "ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [fetchBook, fetchTaxonomies]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const isChecked = (name: string) => {
      const item = form.elements.namedItem(name);
      return item instanceof HTMLInputElement && item.checked;
    };

    data.set("is_published", isChecked("is_published") ? "true" : "false");
    data.set("is_featured", isChecked("is_featured") ? "true" : "false");
    data.set("show_on_homepage", isChecked("show_on_homepage") ? "true" : "false");

    if (coverFile) {
      data.set("cover_image", coverFile);
    } else {
      data.delete("cover_image");
    }

    if (pdfFile) {
      data.set("pdf_file", pdfFile);
    } else if (isEdit) {
      data.delete("pdf_file");
    }

    if (!data.get("pages")) {
      data.set("pages", "0");
    }
    ["category", "author"].forEach((field) => {
      if (!data.get(field)) {
        data.delete(field);
      }
    });

    try {
      const res = await authFetch(isEdit ? `/books/list/${bookId}/` : "/books/list/", {
        method: isEdit ? "PATCH" : "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        const message = errorData
          ? Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`).join("; ")
          : "বই সংরক্ষণ করতে সমস্যা হয়েছে।";
        throw new Error(message);
      }

      router.push("/admin/books");
    } catch (err) {
      setError(err instanceof Error ? err.message : "বই সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const value = (field: keyof BookDetail) => book?.[field] ?? "";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <FaArrowLeft className="text-gray-400 w-3.5 h-3.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? "বই সম্পাদনা" : "নতুন বই / পিডিএফ যোগ করুন"}</h1>
          <p className="text-xs text-gray-400 mt-0.5">বইয়ের তথ্য, কভার এবং পিডিএফ ফাইল পরিচালনা করুন</p>
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <FaBookOpen className="text-primary-500 w-4 h-4" />
                <h3 className="font-semibold text-gray-800 text-sm">বইয়ের তথ্য</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বইয়ের নাম *</label>
                  <input name="title" defaultValue={String(value("title"))} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none" placeholder="যেমন: তাসাউফের পরিচয়" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ক্যাটাগরি</label>
                    <select name="category" defaultValue={String(value("category") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">ভাষা</label>
                    <select name="language" defaultValue={String(value("language") || "bn")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      {BOOK_LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">লেখক</label>
                    <select name="author" defaultValue={String(value("author") || "")} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">লেখক নির্বাচন করুন</option>
                      {authors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">অনুবাদক</label>
                    <input name="translator" defaultValue={String(value("translator"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রকাশক</label>
                    <input name="publisher" defaultValue={String(value("publisher"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">প্রকাশের বছর</label>
                    <input name="publication_year" defaultValue={String(value("publication_year"))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">পৃষ্ঠা সংখ্যা</label>
                    <input name="pages" type="number" min="0" defaultValue={String(value("pages") || 0)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">সংক্ষিপ্ত বর্ণনা</label>
                  <input name="short_description" defaultValue={String(value("short_description"))} maxLength={300} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="আর্কাইভ পেজে দেখানোর জন্য ছোট বর্ণনা" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">বিস্তারিত বর্ণনা</label>
                  <textarea name="description" defaultValue={String(value("description"))} rows={7} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="বইয়ের বিষয়বস্তু, পরিচিতি ও পাঠ নির্দেশনা লিখুন"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">প্রকাশনা</h4>
              <div className="space-y-3 mb-4">
                <label className="flex items-center justify-between text-xs text-gray-600">
                  প্রকাশিত
                  <input name="is_published" type="checkbox" defaultChecked={book?.is_published ?? true} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  ফিচার্ড বই
                  <input name="is_featured" type="checkbox" defaultChecked={book?.is_featured ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
                <label className="flex items-center justify-between text-xs text-gray-600">
                  হোমপেজে দেখান
                  <input name="show_on_homepage" type="checkbox" defaultChecked={book?.show_on_homepage ?? false} className="w-4 h-4 accent-primary-500" />
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                <FaSave className="w-3.5 h-3.5" />
                {saving ? "সংরক্ষণ হচ্ছে..." : isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaFilePdf className="text-red-500 w-3.5 h-3.5" /> পিডিএফ ফাইল {isEdit ? "" : "*"}
              </h4>
              {book?.pdf_file && !pdfFile && (
                <a href={mediaUrl(book.pdf_file)} target="_blank" rel="noreferrer" className="block mb-3 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                  বর্তমান পিডিএফ দেখুন
                </a>
              )}
              <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                <FaFilePdf className="w-7 h-7 text-red-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">{pdfFile ? pdfFile.name : "PDF আপলোড করুন"}</p>
                <input name="pdf_file" type="file" accept="application/pdf,.pdf" required={!isEdit} className="hidden" onChange={handlePdfChange} />
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaImage className="text-gray-400 w-3.5 h-3.5" /> কভার ছবি
              </h4>
              {coverPreview ? (
                <div className="relative">
                  <Image src={coverPreview} alt="Book cover preview" width={320} height={420} className="w-full h-72 object-cover rounded-xl" unoptimized />
                  <button type="button" onClick={() => { setCoverPreview(null); setCoverFile(null); }} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600">
                    <FaTrash className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                  <FaImage className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">কভার আপলোড করুন</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
