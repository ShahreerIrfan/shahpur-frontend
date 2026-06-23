"use client";

import { useEffect, useState } from "react";
import SpaLink from "@/components/SpaLink";
import { FaUser, FaBell, FaBars, FaExternalLinkAlt } from "react-icons/fa";

interface AdminHeaderProps {
    onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
    const [username, setUsername] = useState("");

    useEffect(() => {
        setUsername(localStorage.getItem("username") || "Admin");
    }, []);

    return (
        <header className="sticky top-0 z-[900] bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 text-gray-500 hover:bg-gray-55 rounded-xl transition-colors shrink-0"
                    aria-label="Toggle Menu"
                >
                    <FaBars className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-medium text-gray-550 truncate">অ্যাডমিন ড্যাশবোর্ড</h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <SpaLink
                    href="https://shahpurdarbarsharif.org/"
                    target="_blank"
                    rel="noreferrer"
                    title="ওয়েবসাইট দেখুন"
                    aria-label="ওয়েবসাইট দেখুন"
                    className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 text-gray-400 transition-colors"
                >
                    <FaExternalLinkAlt className="w-4 h-4" />
                </SpaLink>
                <button className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors relative">
                    <FaBell className="text-gray-400 w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2.5 py-1.5 md:px-3 md:py-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shrink-0">
                        <FaUser className="text-white w-3 h-3" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700 font-medium truncate max-w-[80px] md:max-w-none">{username}</span>
                </div>
            </div>
        </header>
    );
}

