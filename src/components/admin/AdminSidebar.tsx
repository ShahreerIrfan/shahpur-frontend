"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaMosque, FaBookOpen, FaCog, FaSignOutAlt, FaImages, FaChevronRight, FaChevronDown, FaChevronUp, FaUserTie } from "react-icons/fa";

interface MenuItem {
    title: string;
    href?: string;
    icon: React.ReactNode;
    children?: { title: string; href: string }[];
}

const menuItems: MenuItem[] = [
    { title: "ড্যাশবোর্ড", href: "/admin", icon: <FaHome className="w-4 h-4" /> },
    {
        title: "মাদ্রাসা",
        icon: <FaBookOpen className="w-4 h-4" />,
        children: [
            { title: "সকল মাদ্রাসা", href: "/admin/madrasha" },
            { title: "নতুন মাদ্রাসা যোগ", href: "/admin/madrasha/create" },
            { title: "জেলা (District)", href: "/admin/madrasha/district" },
            { title: "থানা (Upazila)", href: "/admin/madrasha/upazila" },
        ],
    },
    {
        title: "খানকাহ",
        icon: <FaMosque className="w-4 h-4" />,
        children: [
            { title: "সকল খানকাহ", href: "/admin/khankah" },
            { title: "নতুন খানকাহ যোগ", href: "/admin/khankah/create" },
        ],
    },
    { title: "শিক্ষক তালিকা", href: "/admin/teachers", icon: <FaUserTie className="w-4 h-4" /> },
    { title: "স্লাইডার", href: "/admin/sliders", icon: <FaImages className="w-4 h-4" /> },
    { title: "সেটিংস", href: "/admin/settings", icon: <FaCog className="w-4 h-4" /> },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    useEffect(() => {
        onClose();
        menuItems.forEach((item) => {
            if (item.children && isChildActive(item.children)) {
                setExpandedMenus((prev) =>
                    prev.includes(item.title) ? prev : [...prev, item.title]
                );
            }
        });
    }, [pathname]);

    const toggleMenu = (title: string) => {
        setExpandedMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    const isChildActive = (children: { title: string; href: string }[]) => {
        return children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    };

    return (
        <aside className={`w-[260px] bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm fixed lg:static top-0 bottom-0 left-0 z-[999] transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {/* Logo */}
            <div className="p-5 border-b border-gray-100">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">শ</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 text-sm leading-tight">শাহপুর দরবার শরীফ</h2>
                        <p className="text-[11px] text-gray-400">অ্যাডমিন প্যানেল</p>
                    </div>
                </Link>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider px-3 mb-2">মেনু</p>
                {menuItems.map((item) => {
                    // Parent menu with children
                    if (item.children) {
                        const isExpanded = expandedMenus.includes(item.title);
                        const isActive = isChildActive(item.children);
                        return (
                            <div key={item.title}>
                                <button
                                    onClick={() => toggleMenu(item.title)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-primary-50 text-primary-700 border border-primary-100"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={isActive ? "text-primary-600" : "text-gray-400"}>{item.icon}</span>
                                        {item.title}
                                    </div>
                                    {isExpanded ? (
                                        <FaChevronUp className="w-2.5 h-2.5 text-gray-400" />
                                    ) : (
                                        <FaChevronDown className="w-2.5 h-2.5 text-gray-400" />
                                    )}
                                </button>
                                {isExpanded && (
                                    <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                                        {item.children.map((child) => {
                                            const isChildItemActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${isChildItemActive
                                                            ? "bg-primary-50 text-primary-700"
                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                        }`}
                                                >
                                                    {child.title}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Simple menu item
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href!));
                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? "text-primary-600" : "text-gray-400"}>{item.icon}</span>
                                {item.title}
                            </div>
                            {isActive && <FaChevronRight className="w-2.5 h-2.5 text-primary-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                    <FaSignOutAlt className="w-4 h-4" />
                    লগআউট
                </button>
            </div>
        </aside>
    );
}
