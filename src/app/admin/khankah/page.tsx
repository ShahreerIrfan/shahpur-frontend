"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaPlus, FaMosque, FaSearch, FaEdit, FaTrash, FaSpinner, FaEye } from "react-icons/fa";
import Pagination from "@/components/ui/Pagination";

interface Khankah {
    id: number;
    slug: string;
    khankah_name: string;
    village: string;
    union: string;
    director_name: string;
}

export default function AdminKhankahPage() {
    const [khankahs, setKhankahs] = useState<Khankah[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const PAGE_SIZE = 10;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const fetchKhankahs = async (currentPage = page, currentSearch = search) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const params = new URLSearchParams();
            params.set("page", String(currentPage));
            if (currentSearch.trim()) params.set("search", currentSearch.trim());

            const res = await fetch(`${API_URL}/khankah/list/?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setKhankahs(data);
                    setCount(data.length);
                } else {
                    setKhankahs(data.results || []);
                    setCount(data.count || 0);
                }
            }
        } catch (err) {
            console.error("Failed to fetch khankahs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKhankahs(page, search);
        }, 250);
        return () => clearTimeout(timer);
    }, [page, search]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/khankah/list/${deleteId}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok || res.status === 204) {
                setKhankahs(khankahs.filter((k) => k.id !== deleteId));
                setDeleteId(null);
                setCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Failed to delete khankah", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const filteredKhankahs = khankahs;
    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">খানকাহ পরিচালনা</h1>
                    <p className="text-xs text-gray-400 mt-0.5">সকল খানকাহ শরীফের তথ্য পরিচালনা করুন</p>
                </div>
                <Link
                    href="/admin/khankah/create"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                    <FaPlus className="w-3 h-3" /> নতুন খানকাহ
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="খানকাহ খুঁজুন..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
                    <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500 text-sm">তথ্য লোড হচ্ছে...</p>
                </div>
            ) : filteredKhankahs.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <FaMosque className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো খানকাহ যোগ করা হয়নি</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">নতুন খানকাহ শরীফের তথ্য যোগ করতে নিচের বাটনে ক্লিক করুন</p>
                    <Link
                        href="/admin/khankah/create"
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
                    >
                        <FaPlus className="w-3 h-3" /> প্রথম খানকাহ যোগ করুন
                    </Link>
                </div>
            ) : (
                /* Table */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">SL</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">নাম</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">গ্রাম</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ইউনিয়ন</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">পরিচালক</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredKhankahs.map((khankah, index) => (
                                    <tr key={khankah.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-500">{(page - 1) * PAGE_SIZE + index + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-800">{khankah.khankah_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{khankah.village || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{khankah.union || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{khankah.director_name || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/khankah/${khankah.id}`}
                                                    target="_blank"
                                                    className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                                                    title="প্রিভিউ"
                                                >
                                                    <FaEye className="w-3 h-3" />
                                                </Link>
                                                <Link
                                                    href={`/admin/khankah/edit/${khankah.id}`}
                                                    className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                                    title="এডিট"
                                                >
                                                    <FaEdit className="w-3 h-3" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(khankah.id)}
                                                    className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">
                            মোট {count}টি খানকাহর মধ্যে {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, count)}টি দেখানো হচ্ছে
                        </p>
                        {totalPages > 1 && (
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">খানকাহ মুছে ফেলুন</h3>
                        <p className="text-sm text-gray-500 mb-6">আপনি কি নিশ্চিত যে এই খানকাহটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors"
                            >
                                {deleting ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
