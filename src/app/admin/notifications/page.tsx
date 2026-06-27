"use client";

import { useEffect, useState } from "react";
import { FaBell, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaImage } from "react-icons/fa";
import { authFetch } from "@/lib/api";
import { mediaUrl } from "@/lib/media";

interface NotificationHistory {
    id: number;
    title: string;
    description: string;
    image: string | null;
    sent_count: number;
    created_at: string;
}

export default function AdminNotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formImage, setFormImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const fetchNotifications = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await authFetch(`/core/notifications/?page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.results || []);
                setTotalCount(data.count || 0);
                setTotalPages(Math.ceil((data.count || 0) / 10));
            } else {
                throw new Error("নোটিফিকেশন তালিকা লোড করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "সার্ভারে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই নোটিফিকেশন হিস্টোরি ডিলিট করতে চান? (এটি ডিভাইস থেকে নোটিফিকেশন সরাবে না, শুধুমাত্র ড্যাশবোর্ড থেকে মুছবে)")) return;

        setDeletingId(id);
        setError("");
        try {
            const res = await authFetch(`/core/notifications/${id}/`, {
                method: "DELETE"
            });
            if (res.ok) {
                if (notifications.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchNotifications();
                }
            } else {
                throw new Error("ডিলিট করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "ডিলিট করার সময় সমস্যা হয়েছে।");
            setDeletingId(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormImage(file);
            
            // Generate Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormTitle("");
        setFormDescription("");
        setFormImage(null);
        setImagePreview(null);
        setError("");
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formDescription.trim()) {
            setError("শিরোনাম এবং বর্ণনা আবশ্যক।");
            return;
        }

        setSending(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("title", formTitle);
        formData.append("description", formDescription);
        if (formImage) {
            formData.append("image", formImage);
        }

        try {
            const res = await authFetch("/core/notifications/", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSuccess(`পুশ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে! (মোট ${data.sent_count || 0} টি ডিভাইসে পৌঁছেছে)`);
                handleCloseModal();
                setPage(1);
                fetchNotifications();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.detail || "নোটিফিকেশন পাঠাতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "নোটিফিকেশন পাঠানোর সময় সমস্যা হয়েছে।");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBell className="text-primary-500" />
                        পুশ নোটিফিকেশন
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        মোবাইল অ্যাপ এবং ওয়েবসাইট ব্যবহারকারীদের সরাসরি পুশ নোটিফিকেশন পাঠান
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
                >
                    <FaPlus className="w-3 h-3" />
                    নতুন নোটিফিকেশন পাঠান
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                    {success}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20">
                        <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-semibold">কোনো নোটিফিকেশন পাঠানো হয়নি</p>
                        <p className="text-gray-400 text-xs mt-1">ডানদিকের "নতুন নোটিফিকেশন পাঠান" বোতামে ক্লিক করে প্রথম পুশ নোটিফিকেশনটি পাঠান।</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">ছবি</th>
                                    <th className="py-4 px-6">নোটিফিকেশন টাইটেল</th>
                                    <th className="py-4 px-6">বর্ণনা</th>
                                    <th className="py-4 px-6">প্রেরিত সংখ্যা (ডিভাইস)</th>
                                    <th className="py-4 px-6">তারিখ ও সময়</th>
                                    <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {notifications.map((notif) => (
                                    <tr key={notif.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            {notif.image ? (
                                                <img 
                                                    src={mediaUrl(notif.image)} 
                                                    alt={notif.title} 
                                                    className="w-12 h-8 rounded object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-150 text-gray-400">
                                                    <FaImage className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-gray-800">{notif.title}</td>
                                        <td className="py-4 px-6 text-gray-500 max-w-xs truncate">{notif.description}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex px-3 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                                {notif.sent_count} টি
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500">
                                            {new Date(notif.created_at).toLocaleString("bn-BD", {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                disabled={deletingId === notif.id}
                                                onClick={() => handleDelete(notif.id)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                                title="ডিলিট করুন"
                                            >
                                                {deletingId === notif.id ? (
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
                        পৃষ্ঠা {page} / {totalPages} (মোট {totalCount} টি নোটিফিকেশন)
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

            {/* New Notification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaBell className="text-primary-500" />
                                নতুন পুশ নোটিফিকেশন পাঠান
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSendNotification} className="p-6 space-y-5 flex-1 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs">
                                    {error}
                                </div>
                            )}

                            {/* Title Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">নোটিফিকেশনের শিরোনাম (Title) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="যেমন: ওরস শরীফের মাহফিল"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">নোটিফিকেশন বার্তা (Description) <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="আপনার নোটিফিকেশন বার্তাটি এখানে লিখুন যা ব্যবহারকারীরা তাদের মোবাইলে বা স্ক্রিনে দেখতে পাবেন..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Image Upload Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">সংযুক্ত ব্যানার / ছবি (ঐচ্ছিক)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary-500 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-all">
                                        <FaImage className="w-6 h-6 text-gray-400 mb-2" />
                                        <span className="text-[11px] text-gray-500 font-semibold">ছবি সিলেক্ট করতে ক্লিক করুন</span>
                                        <span className="text-[9px] text-gray-400 mt-0.5">JPG, PNG (সর্বোচ্চ 10MB)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    {/* Preview container */}
                                    {imagePreview && (
                                        <div className="relative w-28 h-20 rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-gray-50">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                            >
                                                <FaTimes size={8} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                                >
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                            পাঠানো হচ্ছে...
                                        </>
                                    ) : (
                                        "পাঠিয়ে দিন"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
