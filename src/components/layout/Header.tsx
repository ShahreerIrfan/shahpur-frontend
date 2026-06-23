"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { fetchSiteSettings, SiteSettings } from "@/lib/appearance";
import { mediaUrl } from "@/lib/media";

const menuItems: {
    title: string;
    url: string;
    comingSoon?: boolean;
    children?: { title: string; url: string; comingSoon?: boolean }[];
}[] = [
    { title: "হোম", url: "/" },
    {
        title: "জীবনী",
        url: "#",
        children: [
            { title: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এঁর জীবনী", url: "/biography/baghdadi" },
            { title: "মাও. আব্দুস সুবহান (রাঃ) এঁর জীবনী", url: "/biography/subhan" },
        ],
    },
    { title: "হাদিস", url: "/hadith" },
    { title: "বই", url: "/books" },
    { title: "মাদ্রাসা", url: "/madrasha" },
    { title: "খানকাহ", url: "/khankah" },
    { title: "ইভেন্ট", url: "/events" },
    { title: "মাজিউন্নবী", url: "#", comingSoon: true },
    {
        title: "আরও দেখুন",
        url: "#",
        children: [
            { title: "সেবা কার্যক্রম", url: "/seva" },
            { title: "গ্যালারি", url: "/gallery" },
            { title: "যোগাযোগ", url: "/contact" },
        ],
    },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("access_token"));
        setIsAdmin(localStorage.getItem("is_admin") === "true");
        fetchSiteSettings().then(setSettings).catch(() => undefined);
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) {
            setOpenMobileSubmenu(null);
        }
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    return (
        <header className="w-full">
            {/* Top bar with Islamic greeting */}
            <div className="bg-primary-900 text-white text-center py-1.5 text-sm">
                <p className="arabic-text inline-block ml-2 text-gold-light">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            </div>

            {/* Main header */}
            <div className="bg-white shadow-md border-b-2 border-primary-500">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo / Site Name */}
                        <Link href="/" prefetch={false} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
                                {settings?.logo ? (
                                    <img src={mediaUrl(settings.logo)} alt={settings.site_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-lg font-bold">শ</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-primary-700 leading-tight">
                                    {settings?.site_name || "শাহপুর দরবার শরীফ"}
                                </h1>
                                <p className="text-xs text-gray-500">{settings?.site_name_en || "Shahpur Darbar Sharif"}</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {menuItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="relative group"
                                    onMouseEnter={() => item.children && setOpenDropdown(item.title)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    {item.comingSoon ? (
                                        <span className="px-4 py-2 text-gray-400 rounded-md font-medium text-[15px] cursor-default inline-flex items-center gap-1">
                                            {item.title}
                                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">Soon</span>
                                        </span>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            prefetch={false}
                                            className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors font-medium text-[15px]"
                                        >
                                            {item.title}
                                            {item.children && (
                                                <svg className="w-3 h-3 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </Link>
                                    )}

                                    {/* Dropdown */}
                                    {item.children && openDropdown === item.title && (
                                        <div className="absolute top-full left-0 bg-white shadow-lg rounded-md border border-gray-100 py-2 min-w-[320px] z-50">
                                            {item.children.map((child) => (
                                                child.comingSoon ? (
                                                    <span key={child.title} className="block px-4 py-2 text-sm text-gray-400 cursor-default">
                                                        {child.title} <span className="text-[10px] text-amber-600">(Soon)</span>
                                                    </span>
                                                ) : (
                                                    <Link
                                                        key={child.title}
                                                        href={child.url}
                                                        prefetch={false}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        {child.title}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Login/Register / Dashboard */}
                        <div className="hidden lg:flex items-center gap-3 ml-4">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href={isAdmin ? "/admin" : "/dashboard"} 
                                        prefetch={false}
                                        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
                                    >
                                        <FaUser className="w-3.5 h-3.5" />
                                        <span>{isAdmin ? "Admin Panel" : "Dashboard"}</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout} 
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" prefetch={false} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 text-sm font-medium">
                                        <FaUser className="w-3.5 h-3.5" />
                                        <span>Login</span>
                                    </Link>
                                    <Link href="/register" prefetch={false} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-primary-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b shadow-lg">
                    <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.title}>
                                {item.children ? (
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium text-left"
                                        aria-expanded={openMobileSubmenu === item.title}
                                        onClick={() => setOpenMobileSubmenu((current) => current === item.title ? null : item.title)}
                                    >
                                        <span>{item.title}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${openMobileSubmenu === item.title ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                ) : item.comingSoon ? (
                                    <div className="flex items-center justify-between px-4 py-2 text-gray-400 rounded-md font-medium">
                                        <span>{item.title}</span>
                                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">Soon</span>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.url}
                                        prefetch={false}
                                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.title}
                                    </Link>
                                )}
                                {item.children && openMobileSubmenu === item.title && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-primary-100 pl-2">
                                        {item.children.map((child) => (
                                            child.comingSoon ? (
                                                <div key={child.title} className="px-4 py-2 text-sm text-gray-400 rounded-md">
                                                    • {child.title} <span className="text-[10px] text-amber-600">(Soon)</span>
                                                </div>
                                            ) : (
                                                <Link
                                                    key={child.title}
                                                    href={child.url}
                                                    prefetch={false}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    • {child.title}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Mobile Login/Register/Dashboard */}
                        <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href={isAdmin ? "/admin" : "/dashboard"}
                                        prefetch={false}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
                                    >
                                        {isAdmin ? "Admin Panel" : "Dashboard"}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        prefetch={false}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        prefetch={false}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block mx-4 my-2 text-center bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
