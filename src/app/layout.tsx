import type { Metadata } from "next";
import FaviconSync from "@/components/layout/FaviconSync";
import "./globals.css";

export const metadata: Metadata = {
  title: "শাহপুর দরবার শরীফ | Shahpur Darbar Sharif",
  description:
    "কুমিল্লার গোমতী নদী তীরবর্তী শাহপুর দরবার শরীফ - ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার ও আধ্যাত্মিক সাধনার কেন্দ্র",
  icons: {
    icon: "/api/favicon",
    shortcut: "/api/favicon",
    apple: "/api/favicon",
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
        {children}
      </body>
    </html>
  );
}
