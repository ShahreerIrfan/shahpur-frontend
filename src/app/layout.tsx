import type { Metadata } from "next";
import { Suspense } from "react";
import FaviconSync from "@/components/layout/FaviconSync";
import RouteChangeSync from "@/components/layout/RouteChangeSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "শাহপুর দরবার শরীফ | Shahpur Darbar Sharif",
  description:
    "কুমিল্লার গোমতী নদী তীরবর্তী শাহপুর দরবার শরীফ - ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার ও আধ্যাত্মিক সাধনার কেন্দ্র",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-gray-50">
        <FaviconSync />
        <Suspense fallback={null}>
          <RouteChangeSync />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
