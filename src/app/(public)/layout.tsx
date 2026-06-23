"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <>
            <Header />
            <main key={pathname} className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
