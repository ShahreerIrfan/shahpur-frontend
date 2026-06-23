"use client";

import { useEffect, useState } from "react";
import SpaLink from "@/components/SpaLink";
import { FaBook, FaEdit, FaPlus, FaSpinner, FaTrash } from "react-icons/fa";
import { authFetch, API_URL } from "@/lib/api";
import { HadithListItem } from "@/lib/hadiths";

export default function AdminHadithsPage() {
    const [hadiths, setHadiths] = useState<HadithListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await authFetch("/hadiths/list/");
                if (res.ok) {
                    const data = await res.json();
                    setHadiths(data.results || []);
                }
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("এই হাদিসটি মুছে ফেলতে চান?")) return;
        await authFetch(`/hadiths/list/${id}/`, { method: "DELETE" });
        setHadiths((prev) => prev.filter((h) => h.id !== id));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">হাদিস সমূহ</h1>
                    <p className="text-xs text-gray-400 mt-0.5">সকল হাদিস পরিচালনা করুন</p>
                </div>
                <SpaLink href="/admin/hadiths/create" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm">
                    <FaPlus className="w-3 h-3" /> নতুন হাদিস
                </SpaLink>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><FaSpinner className="w-8 h-8 text-primary-500 animate-spin" /></div>
            ) : hadiths.length === 0 ? (
                <div className="text-center py-20 text-gray-400">কোনো হাদিস পাওয়া যায়নি</div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">শিরোনাম</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">নম্বর</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">সংকলন</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">মান</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">বিষয়</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hadiths.map((h) => (
                                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{h.title}</td>
                                    <td className="px-4 py-3 text-gray-600">{h.hadith_number}</td>
                                    <td className="px-4 py-3 text-gray-600">{h.collection_name}</td>
                                    <td className="px-4 py-3"><span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{h.grade_display}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">{h.taxonomy_names.map((t, i) => <span key={i} className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded text-xs">{t}</span>)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <SpaLink href={`/admin/hadiths/edit/${h.id}`} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100"><FaEdit className="w-3 h-3" /></SpaLink>
                                            <button onClick={() => handleDelete(h.id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100"><FaTrash className="w-3 h-3" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
