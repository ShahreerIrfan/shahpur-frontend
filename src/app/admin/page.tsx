"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    FaBookOpen, 
    FaMosque, 
    FaUsers, 
    FaGlobe, 
    FaPlus, 
    FaArrowRight, 
    FaChartBar, 
    FaSpinner, 
    FaCalendarAlt, 
    FaClock, 
    FaEye 
} from "react-icons/fa";
import { authFetch } from "@/lib/api";

interface StatItem {
    title: string;
    count: number | string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    text: string;
}

interface RecentItem {
    id: number;
    name: string;
    type: "madrasha" | "khankah";
    date: string;
    link: string;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [madrashaCount, setMadrashaCount] = useState<number | string>("০");
    const [khankahCount, setKhankahCount] = useState<number | string>("০");
    const [teacherCount, setTeacherCount] = useState<number | string>("০");
    const [eventCount, setEventCount] = useState<number | string>("০");
    const [recentActivities, setRecentActivities] = useState<RecentItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Madrasha list & count
            const madrashaRes = await authFetch("/madrasha/list/");
            let tempMadrashas: any[] = [];
            if (madrashaRes.ok) {
                const data = await madrashaRes.json();
                setMadrashaCount(data.count);
                tempMadrashas = data.results || [];
            }

            // Fetch Khankah list & count
            const khankahRes = await authFetch("/khankah/list/");
            let tempKhankahs: any[] = [];
            if (khankahRes.ok) {
                const data = await khankahRes.json();
                setKhankahCount(data.count);
                tempKhankahs = data.results || [];
            }

            // Fetch Teacher count
            const teacherRes = await authFetch("/madrasha/teachers/");
            if (teacherRes.ok) {
                const data = await teacherRes.json();
                setTeacherCount(data.count);
            }

            // Fetch Event count
            const eventRes = await authFetch("/events/list/");
            if (eventRes.ok) {
                const data = await eventRes.json();
                setEventCount(data.count);
            }

            // Build recent activities (latest 3 of each)
            const activities: RecentItem[] = [];
            
            tempMadrashas.slice(0, 3).forEach((item: any) => {
                activities.push({
                    id: item.id,
                    name: item.madrasha_name,
                    type: "madrasha",
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString("bn-BD") : "সাম্প্রতিক",
                    link: `/admin/madrasha/edit/${item.id}`
                });
            });

            tempKhankahs.slice(0, 3).forEach((item: any) => {
                activities.push({
                    id: item.id,
                    name: item.khankah_name,
                    type: "khankah",
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString("bn-BD") : "সাম্প্রতিক",
                    link: `/admin/khankah/edit/${item.id}` // assuming editing path
                });
            });

            // Sort by date or id descending
            activities.sort((a, b) => b.id - a.id);
            setRecentActivities(activities.slice(0, 5));

        } catch (err) {
            console.error("Error loading dashboard data", err);
            setError("ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে।");
        } finally {
            setLoading(false);
        }
    };

    const stats: StatItem[] = [
        { 
            title: "মোট মাদ্রাসা", 
            count: madrashaCount, 
            icon: <FaBookOpen className="w-5 h-5" />, 
            color: "from-emerald-500 to-teal-600 shadow-emerald-100", 
            bg: "bg-emerald-50 text-emerald-600",
            text: "মাদ্রাসা সমূহ"
        },
        { 
            title: "খানকাহ শরীফ", 
            count: khankahCount, 
            icon: <FaMosque className="w-5 h-5" />, 
            color: "from-blue-500 to-indigo-600 shadow-blue-100", 
            bg: "bg-blue-50 text-blue-600",
            text: "খানকাহ তালিকা"
        },
        { 
            title: "নিবন্ধিত শিক্ষক", 
            count: teacherCount, 
            icon: <FaUsers className="w-5 h-5" />, 
            color: "from-purple-500 to-violet-600 shadow-purple-100", 
            bg: "bg-purple-50 text-purple-600",
            text: "শিক্ষক তালিকা"
        },
        { 
            title: "ইভেন্ট / মাহফিল", 
            count: eventCount, 
            icon: <FaCalendarAlt className="w-5 h-5" />, 
            color: "from-amber-500 to-orange-600 shadow-amber-100", 
            bg: "bg-amber-50 text-amber-600",
            text: "অনুষ্ঠান তালিকা"
        },
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
                <p className="text-sm text-gray-500 font-medium">ড্যাশবোর্ড লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header / Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-primary-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/5 rounded-full translate-y-40 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-100">অ্যাডমিন ড্যাশবোর্ড</span>
                        <h1 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">আসসালামু আলাইকুম!</h1>
                        <p className="text-primary-100/90 text-sm mt-1">শাহপুর দরবার শরীফ অ্যাডমিন কন্ট্রোল প্যানেলে আপনাকে স্বাগতম।</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link target="_blank" href="/" className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm">
                            ওয়েবসাইট দেখুন
                        </Link>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-350 hover:-translate-y-1 group relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight group-hover:text-primary-600 transition-colors">{stat.count}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-sm`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                            <span>{stat.text}</span>
                            <span className="text-primary-500 font-semibold group-hover:translate-x-1 transition-transform">বিশদ →</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                {/* Quick Actions Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                                <FaChartBar className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">দ্রুত লিঙ্ক ও কাজ</h3>
                                <p className="text-xs text-gray-400">সহজেই তথ্য যোগ করুন বা পরিবর্তন করুন</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/admin/madrasha/create" className="flex flex-col p-5 bg-gradient-to-br from-emerald-50/50 to-white hover:from-emerald-50 rounded-2xl border border-emerald-100/70 hover:border-emerald-200 transition-all group shadow-sm hover:shadow-md">
                                <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
                                    <FaPlus className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">নতুন মাদ্রাসা</span>
                                <span className="text-xs text-gray-400 mt-1">লিস্টে নতুন মাদ্রাসা যোগ করুন</span>
                            </Link>

                            <Link href="/admin/khankah/create" className="flex flex-col p-5 bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-50 rounded-2xl border border-blue-100/70 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md">
                                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                                    <FaPlus className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">নতুন খানকাহ</span>
                                <span className="text-xs text-gray-400 mt-1">নতুন খানকাহ শরীফ যোগ করুন</span>
                            </Link>

                            <Link href="/admin/events/create" className="flex flex-col p-5 bg-gradient-to-br from-amber-50/50 to-white hover:from-amber-50 rounded-2xl border border-amber-100/70 hover:border-amber-200 transition-all group shadow-sm hover:shadow-md">
                                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3">
                                    <FaPlus className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">নতুন ইভেন্ট</span>
                                <span className="text-xs text-gray-400 mt-1">মাহফিল বা ওরশের তথ্য যোগ করুন</span>
                            </Link>

                            <Link href="/admin/madrasha" className="flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-150 transition-all group">
                                <div className="w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaBookOpen className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-800">মাদ্রাসা ম্যানেজ</p>
                                    <p className="text-[10px] text-gray-400">সকল মাদ্রাসা তালিকা</p>
                                </div>
                                <FaArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 ml-auto transition-transform group-hover:translate-x-0.5" />
                            </Link>

                            <Link href="/admin/khankah" className="flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-150 transition-all group">
                                <div className="w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaMosque className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-800">খানকাহ ম্যানেজ</p>
                                    <p className="text-[10px] text-gray-400">সকল খানকাহ তালিকা</p>
                                </div>
                                <FaArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 ml-auto transition-transform group-hover:translate-x-0.5" />
                            </Link>

                            <Link href="/admin/events" className="flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-150 transition-all group">
                                <div className="w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FaCalendarAlt className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-gray-800">ইভেন্ট ম্যানেজ</p>
                                    <p className="text-[10px] text-gray-400">সকল মাহফিল তালিকা</p>
                                </div>
                                <FaArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 ml-auto transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 pt-5 border-t border-gray-50">
                        <Link href="/admin/settings" className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-2xl text-sm font-semibold transition-colors shadow-sm">
                            প্যানেল সেটিংস দেখুন
                        </Link>
                    </div>
                </div>

                {/* Recent Activities Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                            <FaClock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">সাম্প্রতিক কার্যক্রম</h3>
                            <p className="text-xs text-gray-400">সর্বশেষ আপডেট হওয়া আইটেম সমূহ</p>
                        </div>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                <FaChartBar className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">কোনো সাম্প্রতিক কার্যক্রম নেই</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivities.map((act) => (
                                <div key={`${act.type}-${act.id}`} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                                            act.type === "madrasha" 
                                                ? "bg-emerald-100 text-emerald-700" 
                                                : "bg-blue-100 text-blue-700"
                                        }`}>
                                            {act.type === "madrasha" ? <FaBookOpen className="w-4 h-4" /> : <FaMosque className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-1">{act.name}</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                                <FaCalendarAlt size={10} />
                                                {act.date}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={act.link} className="w-8 h-8 bg-white border border-gray-200 text-gray-500 hover:text-primary-600 rounded-xl flex items-center justify-center shadow-sm transition-colors">
                                        <FaEye size={12} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
