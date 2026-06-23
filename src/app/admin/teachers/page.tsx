"use client";

import { useEffect, useState } from "react";
import { FaUserTie, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";
import Link from "next/link";

interface Teacher {
    id: number;
    madrasha: number;
    madrasha_name: string;
    teacher_name: string;
    teacher_image: string | null;
    teacher_education_qualification: string;
    teacher_phone_number: string;
}

export default function AdminTeachersPage() {
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTeachers();
    }, [page]);

    const fetchTeachers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch(`/madrasha/teachers/?page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setTeachers(data.results || []);
                setTotalCount(data.count || 0);
                setTotalPages(Math.ceil((data.count || 0) / 10));
            } else {
                throw new Error("শিক্ষক তালিকা লোড করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "সার্ভারে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষককে ডিলিট করতে চান?")) return;

        setDeletingId(id);
        setError("");
        try {
            const res = await authFetch(`/madrasha/teachers/${id}/`, {
                method: "DELETE"
            });
            if (res.ok) {
                // If it was the last item on the page and we're not on page 1, go to previous page
                if (teachers.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchTeachers();
                }
            } else {
                throw new Error("ডিলিট করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "ডিলিট করার সময় সমস্যা হয়েছে।");
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaUserTie className="text-primary-500" />
                        শিক্ষক তালিকা
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">দরবার শরীফের মাদ্রাসাসমূহের সকল শিক্ষক তালিকা ({totalCount} জন)</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-20">
                        <FaUserTie className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-semibold">কোনো শিক্ষক পাওয়া যায়নি</p>
                        <p className="text-gray-400 text-xs mt-1">মাদ্রাসা এডিট ফর্মে গিয়ে শিক্ষক যোগ করুন</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">ছবি</th>
                                    <th className="py-4 px-6">শিক্ষকের নাম</th>
                                    <th className="py-4 px-6">যোগ্যতা</th>
                                    <th className="py-4 px-6">ফোন নাম্বার</th>
                                    <th className="py-4 px-6">মাদ্রাসা</th>
                                    <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            {teacher.teacher_image ? (
                                                <img 
                                                    src={mediaUrl(teacher.teacher_image)} 
                                                    alt={teacher.teacher_name} 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 font-bold">
                                                    {teacher.teacher_name ? teacher.teacher_name[0] : "?"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-800">{teacher.teacher_name}</td>
                                        <td className="py-4 px-6 text-gray-600">{teacher.teacher_education_qualification || "প্রদান করা হয়নি"}</td>
                                        <td className="py-4 px-6 text-gray-600 font-medium">{teacher.teacher_phone_number || "প্রদান করা হয়নি"}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                                {teacher.madrasha_name || "মাদ্রাসা"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                disabled={deletingId === teacher.id}
                                                onClick={() => handleDelete(teacher.id)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                title="ডিলিট করুন"
                                            >
                                                {deletingId === teacher.id ? (
                                                    <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <FaTrash className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-400">
                        পৃষ্ঠা {page} / {totalPages} (মোট {totalCount} জন শিক্ষক)
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <FaChevronLeft size={10} />
                            পূর্ববর্তী
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-colors disabled:opacity-50"
                        >
                            পরবর্তী
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
