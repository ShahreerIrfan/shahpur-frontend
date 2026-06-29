"use client";

import { useEffect, useState } from "react";
import { FaBell, FaPlus, FaTrash, FaSpinner, FaTimes, FaImage, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { mediaUrl } from "@/lib/media";
import { authFetch } from "@/lib/api";

interface Announcement {
    id: number;
    title: string;
    category: string;
    category_display: string;
    short_description: string;
    description: string;
    image: string | null;
    status: string;
    status_display: string;
    publisher: string;
    publisher_display: string;
    sent_count: number;
    created_at: string;
}

export default function AdminNotificationsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formCategory, setFormCategory] = useState("announcement");
    const [formShortDesc, setFormShortDesc] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formPublisher, setFormPublisher] = useState("admin");
    const [formStatus, setFormStatus] = useState("published");
    const [formImage, setFormImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [sending, setSending] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchAnnouncements();
    }, [page]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`/core/notifications/?page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.results || []);
                setTotalCount(data.count || 0);
                setTotalPages(Math.ceil((data.count || 0) / 10));
            }
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই ঘোষণা/নোটিশটি ডিলিট করতে চান?")) return;
        setDeletingId(id);
        try {
            const res = await authFetch(`/core/notifications/${id}/`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccess("ঘোষণা/নোটিশটি সফলভাবে ডিলিট করা হয়েছে।");
                if (announcements.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchAnnouncements();
                }
            } else {
                throw new Error("ডিলিট করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "ডিলিট করার সময় সমস্যা হয়েছে।");
        } finally {
            setDeletingId(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("ছবির সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না।");
                return;
            }
            setFormImage(file);
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
        setFormCategory("announcement");
        setFormShortDesc("");
        setFormDescription("");
        setFormPublisher("admin");
        setFormStatus("published");
        setFormImage(null);
        setImagePreview(null);
        setError("");
    };

    const handleSendAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formDescription.trim()) {
            setError("শিরোনাম এবং বিস্তারিত বিবরণ আবশ্যক।");
            return;
        }

        setSending(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("title", formTitle);
        formData.append("category", formCategory);
        formData.append("short_description", formShortDesc);
        formData.append("description", formDescription);
        formData.append("publisher", formPublisher);
        formData.append("status", formStatus);
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
                if (data.status === "published") {
                    setSuccess(`ঘোষণাটি সফলভাবে প্রকাশিত হয়েছে এবং ${data.sent_count || 0} টি ডিভাইসে পুশ নোটিফিকেশন পাঠানো হয়েছে!`);
                } else {
                    setSuccess("ঘোষণাটি খসড়া হিসেবে সফলভাবে সংরক্ষিত হয়েছে।");
                }
                handleCloseModal();
                setPage(1);
                fetchAnnouncements();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.detail || "সংরক্ষণ করতে ব্যর্থ হয়েছে।");
            }
        } catch (err: any) {
            setError(err.message || "সংরক্ষণ করার সময় সমস্যা হয়েছে।");
        } finally {
            setSending(false);
        }
    };

    const getStatusLabelClass = (status: string) => {
        switch (status) {
            case "published":
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "draft":
                return "bg-amber-50 text-amber-700 border-amber-100";
            default:
                return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const getCategoryLabelClass = (category: string) => {
        switch (category) {
            case "notice":
                return "bg-blue-50 text-blue-700 border-blue-100";
            case "announcement":
                return "bg-amber-50 text-amber-700 border-amber-100";
            default:
                return "bg-emerald-50 text-emerald-700 border-emerald-100";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBell className="text-primary-500" />
                        ঘোষণা ও নোটিশ পরিচালনা
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        দারবার শরীফের সকল নোটিশ এবং ঘোষণা তৈরি করুন, যা ব্যবহারকারীদের পুশ নোটিফিকেশন পাঠাবে
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
                >
                    <FaPlus className="w-3 h-3" />
                    নতুন ঘোষণা / নোটিশ তৈরি করুন
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
                ) : announcements.length === 0 ? (
                    <div className="text-center py-20">
                        <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-semibold">কোনো ঘোষণা বা নোটিশ পাওয়া যায়নি</p>
                        <p className="text-gray-400 text-xs mt-1">ডানদিকের বোতামে ক্লিক করে প্রথম ঘোষণা বা নোটিশটি তৈরি করুন।</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-4 px-6">ছবি</th>
                                    <th className="py-4 px-6">শিরোনাম</th>
                                    <th className="py-4 px-6">ক্যাটাগরি</th>
                                    <th className="py-4 px-6">প্রকাশক</th>
                                    <th className="py-4 px-6">স্ট্যাটাস</th>
                                    <th className="py-4 px-6">প্রেরিত (ডিভাইস)</th>
                                    <th className="py-4 px-6">তারিখ ও সময়</th>
                                    <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {announcements.map((notif) => (
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
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${getCategoryLabelClass(notif.category)}`}>
                                                {notif.category_display}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 font-semibold">{notif.publisher_display}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusLabelClass(notif.status)}`}>
                                                {notif.status_display}
                                            </span>
                                        </td>
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
                        পৃষ্ঠা {page} / {totalPages} (মোট {totalCount} টি ঘোষণা/নোটিশ)
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

            {/* New Announcement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaBell className="text-primary-500" />
                                নতুন ঘোষণা / নোটিশ তৈরি করুন
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSendAnnouncement} className="p-6 space-y-5 flex-1 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs">
                                    {error}
                                </div>
                            )}

                            {/* Title Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">শিরোনাম (Title) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="যেমন: পবিত্র মিলাদুন্নবী মাহফিলের সময়সূচি পরিবর্তন"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Category, Status, Publisher Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">ক্যাটাগরি <span className="text-red-500">*</span></label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="announcement">ঘোষণা</option>
                                        <option value="notice">নোটিশ</option>
                                        <option value="other">অন্যান্য</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">প্রকাশক <span className="text-red-500">*</span></label>
                                    <select
                                        value={formPublisher}
                                        onChange={(e) => setFormPublisher(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="admin">এডমিন</option>
                                        <option value="office">অফিস</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700">স্ট্যাটাস <span className="text-red-500">*</span></label>
                                    <select
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all cursor-pointer"
                                    >
                                        <option value="published">প্রকাশিত</option>
                                        <option value="draft">খসড়া</option>
                                        <option value="archived">আর্কাইভকৃত</option>
                                    </select>
                                </div>
                            </div>

                            {/* Short Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">সংক্ষিপ্ত বিবরণ (মোবাইল পুশ নোটিফিকেশনে এই লেখাটি প্রদর্শন হবে)</label>
                                <input
                                    type="text"
                                    maxLength={300}
                                    placeholder="সংক্ষিপ্ত আকারে মূল বিষয়টি এখানে লিখুন (সর্বোচ্চ ৩০০ অক্ষরের মধ্যে)..."
                                    value={formShortDesc}
                                    onChange={(e) => setFormShortDesc(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">বিস্তারিত বিবরণ <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="আপনার ঘোষণা বা নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 focus:outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Image Upload Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">সংযুক্ত ব্যানার / ছবি</label>
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
                                            সংরক্ষণ করা হচ্ছে...
                                        </>
                                    ) : (
                                        "সংরক্ষণ করুন"
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
