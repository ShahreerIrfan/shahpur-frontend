"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaPlus, FaBookOpen, FaSearch, FaEdit, FaTrash, FaSpinner, FaEye } from "react-icons/fa";

interface Madrasha {
    id: number;
    slug: string;
    madrasha_name: string;
    district_name: string;
    upazila_name: string;
    type_of_madrasha: string;
    is_published: boolean;
}

const TYPE_LABELS: Record<string, string> = {
    nurani: "নূরানী",
    hifz: "হিফজ",
    najera: "নাজেরা",
    academic: "একাডেমিক",
};

export default function AdminMadrashaPage() {
    const [madrashas, setMadrashas] = useState<Madrasha[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    useEffect(() => {
        fetchMadrashas();
    }, []);

    const fetchMadrashas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/madrasha/list/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setMadrashas(Array.isArray(data) ? data : data.results || []);
            }
        } catch (err) {
            console.error("Failed to fetch madrashas", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`${API_URL}/madrasha/list/${deleteId}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok || res.status === 204) {
                setMadrashas(madrashas.filter((m) => m.id !== deleteId));
                setDeleteId(null);
            }
        } catch (err) {
            console.error("Failed to delete madrasha", err);
        } finally {
            setDeleting(false);
        }
    };

    const filteredMadrashas = [...madrashas]
        .sort((a, b) => b.id - a.id)
        .filter((m) => {
            const matchesSearch = m.madrasha_name.toLowerCase().includes(search.toLowerCase());
            const matchesType = !typeFilter || m.type_of_madrasha === typeFilter;
            return matchesSearch && matchesType;
        });

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">মাদ্রাসা পরিচালনা</h1>
                    <p className="text-sm text-gray-500 mt-1">সকল মাদ্রাসার তথ্য পরিচালনা করুন</p>
                </div>
                <Link
                    href="/admin/madrasha/create"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                    <FaPlus className="w-3 h-3" />
                    নতুন মাদ্রাসা
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="মাদ্রাসা খুঁজুন..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">সকল ধরণ</option>
                        <option value="nurani">নূরানী</option>
                        <option value="hifz">হিফজ</option>
                        <option value="najera">নাজেরা</option>
                        <option value="academic">একাডেমিক</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
                    <FaSpinner className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500 text-sm">তথ্য লোড হচ্ছে...</p>
                </div>
            ) : filteredMadrashas.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <FaBookOpen className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">কোনো মাদ্রাসা যোগ করা হয়নি</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                        নতুন মাদ্রাসার তথ্য যোগ করতে নিচের বাটনে ক্লিক করুন। মাদ্রাসার নাম, ঠিকানা, শিক্ষক তালিকা সহ সকল তথ্য যোগ করতে পারবেন।
                    </p>
                    <Link
                        href="/admin/madrasha/create"
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all"
                    >
                        <FaPlus className="w-3 h-3" />
                        প্রথম মাদ্রাসা যোগ করুন
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
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">জেলা</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">থানা</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ধরণ</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">প্রকাশিত</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMadrashas.map((madrasha, index) => (
                                    <tr key={madrasha.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-800">{madrasha.madrasha_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{madrasha.district_name || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{madrasha.upazila_name || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                                                {TYPE_LABELS[madrasha.type_of_madrasha] || madrasha.type_of_madrasha || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${madrasha.is_published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                {madrasha.is_published ? "প্রকাশিত" : "অপ্রকাশিত"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/madrasha/${madrasha.id}`}
                                                    target="_blank"
                                                    className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                                                    title="প্রিভিউ"
                                                >
                                                    <FaEye className="w-3 h-3" />
                                                </Link>
                                                <Link
                                                    href={`/admin/madrasha/edit/${madrasha.id}`}
                                                    className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                                    title="এডিট"
                                                >
                                                    <FaEdit className="w-3 h-3" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(madrasha.id)}
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
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500">মোট {filteredMadrashas.length}টি মাদ্রাসা</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">মাদ্রাসা মুছে ফেলুন</h3>
                        <p className="text-sm text-gray-500 mb-6">আপনি কি নিশ্চিত যে এই মাদ্রাসাটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
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
