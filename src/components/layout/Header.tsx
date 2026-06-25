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
    { title: "ব্লগ", url: "/blog" },
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
        const authTimer = window.setTimeout(() => {
            setIsLoggedIn(!!localStorage.getItem("access_token"));
            setIsAdmin(localStorage.getItem("is_admin") === "true");
        }, 0);
        fetchSiteSettings().then(setSettings).catch(() => undefined);
        return () => window.clearTimeout(authTimer);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
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
        <header className="sticky top-0 z-[950] w-full">
            {/* Top bar with Islamic greeting */}
            <div className="bg-primary-900 text-white text-center py-1.5 text-sm shadow-sm">
                <p className="arabic-text inline-block ml-2 text-gold-light">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            </div>

            {/* Main header */}
            <div className="bg-gradient-to-b from-black/10 to-transparent px-3 py-2 lg:px-6 lg:py-3">
                <div className="max-w-7xl mx-auto rounded-2xl border border-white/70 bg-white/95 px-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl ring-1 ring-primary-100/70 lg:px-5">
                    <div className="flex items-center justify-between h-16 lg:h-[72px]">
                        {/* Logo / Site Name */}
                        <Link href="/" prefetch={false} className="flex items-center gap-3">
                            <div className="w-11 h-11 lg:w-12 lg:h-12 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-primary-100">
                                {settings?.logo ? (
                                    <img src={mediaUrl(settings.logo)} alt={settings.site_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-lg font-bold">শ</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-bold text-primary-700 leading-tight">
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
                                        <span className="px-3 py-2 text-gray-400 rounded-xl font-medium text-[15px] cursor-default inline-flex items-center gap-1">
                                            {item.title}
                                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full">Soon</span>
                                        </span>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            prefetch={false}
                                            className="px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium text-[15px]"
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
                                        <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-2xl border border-gray-100 py-2 min-w-[320px] z-50">
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
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
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
                                    <Link href="/register" prefetch={false} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-primary-600"
                            onClick={() => {
                                if (mobileMenuOpen) setOpenMobileSubmenu(null);
                                setMobileMenuOpen(!mobileMenuOpen);
                            }}
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

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-[2000] lg:hidden transition-all duration-300 ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
                {/* Backdrop overlay */}
                <div 
                    className={`absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`} 
                    onClick={() => {
                        setOpenMobileSubmenu(null);
                        setMobileMenuOpen(false);
                    }}
                />
                
                {/* Drawer Panel content */}
                <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-[#f8fafc] shadow-2xl transition-transform duration-300 transform flex flex-col p-4 space-y-4 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl border border-primary-100/60 p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-primary-100">
                                {settings?.logo ? (
                                    <img src={mediaUrl(settings.logo)} alt={settings.site_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-base font-bold">শ</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-primary-750 leading-tight">
                                    {settings?.site_name || "শাহপুর দরবার শরীফ"}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-medium">{settings?.site_name_en || "Shahpur Darbar Sharif"}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setOpenMobileSubmenu(null);
                                setMobileMenuOpen(false);
                            }}
                            className="p-1.5 text-gray-450 hover:text-gray-700 hover:bg-gray-105 rounded-xl transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Main Menu Panel Card */}
                    <div className="bg-white rounded-[24px] border border-primary-100/80 p-4 shadow-sm flex flex-col flex-1 overflow-y-auto min-h-0 justify-between">
                        
                        {/* Menu Links */}
                        <div className="space-y-1 overflow-y-auto pr-1">
                            {menuItems.map((item) => (
                                <div key={item.title}>
                                    {item.children ? (
                                        <div>
                                            <button
                                                type="button"
                                                className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary-50/50 hover:text-primary-700 rounded-xl font-bold text-[15px] text-left transition-colors ${
                                                    openMobileSubmenu === item.title ? "text-primary-750 bg-primary-50/30" : "text-gray-700"
                                                }`}
                                                onClick={() => setOpenMobileSubmenu((current) => current === item.title ? null : item.title)}
                                            >
                                                <span>{item.title}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform text-gray-400 ${openMobileSubmenu === item.title ? "rotate-180 text-primary-600" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            
                                            {openMobileSubmenu === item.title && (
                                                <div className="ml-3 pl-3.5 border-l border-primary-100/70 space-y-1 mt-1 transition-all">
                                                    {item.children.map((child) => (
                                                        child.comingSoon ? (
                                                            <div key={child.title} className="px-4 py-2 text-sm text-gray-455 rounded-lg">
                                                                • {child.title} <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1 py-0.5 rounded-full font-bold ml-1">Soon</span>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                key={child.title}
                                                                href={child.url}
                                                                prefetch={false}
                                                                className="block px-4 py-2 text-sm text-gray-650 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors font-semibold"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                • {child.title}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : item.comingSoon ? (
                                        <div className="flex items-center justify-between px-4 py-2.5 text-gray-400 rounded-xl font-bold text-[15px]">
                                            <span>{item.title}</span>
                                            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-bold">Soon</span>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            prefetch={false}
                                            className="block px-4 py-2.5 text-gray-750 hover:bg-primary-50/50 hover:text-primary-700 rounded-xl font-bold text-[15px] transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bottom Footer Section (Admin/Logout/Login) */}
                        <div className="pt-4 border-t border-gray-100 mt-4 space-y-1">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href={isAdmin ? "/admin" : "/dashboard"}
                                        prefetch={false}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2.5 text-gray-755 hover:bg-primary-50/50 hover:text-primary-700 rounded-xl font-bold text-[15px] transition-colors"
                                    >
                                        {isAdmin ? "Admin Panel" : "Dashboard"}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left block px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-[15px] transition-colors"
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
                                        className="block px-4 py-2.5 text-gray-755 hover:bg-primary-50/50 hover:text-primary-700 rounded-xl font-bold text-[15px] transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        prefetch={false}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-center bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm mt-2"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </header>
    );
}
