"use client";

import { useState } from "react";
import { FaBook, FaChevronDown, FaChevronUp } from "react-icons/fa";

const books = [
    "Five Pillars of Islam",
    "Light Upon Light",
    "Marriage of Muhammad (ﷺ)",
    "Marriage of Prophets",
    "Prophet's Love",
    "Arrival of Prophet Muhammad (ﷺ)",
    "Magnanimity of Muhammad (ﷺ) in the Holy Quran",
    "Allah is the Light: From Heaven to Earth",
    "Heart & Soul",
    "নূরুন্নবী (ﷺ) শুভাগমন",
    "নবী প্রেম",
    "নূরের জিকির",
    "কল্ব ও আত্মা",
    "শোগলে কল্ব",
    "বায়াতের দলিল",
    "ইয়া পাক পাঞ্জাতান (আ.) লাখো সালাম",
    "Prophets of Islam",
];

export default function BooksSection() {
    const [showAll, setShowAll] = useState(false);
    const visibleBooks = showAll ? books : books.slice(0, 10);

    return (
        <section className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center">
                        <FaBook className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">রচিত গ্রন্থসমূহ</h2>
                </div>

                {/* Book Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleBooks.map((book, i) => (
                        <div
                            key={i}
                            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
                        >
                            <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                {i + 1}
                            </span>
                            <FaBook className="w-6 h-6 text-primary-500 shrink-0" />
                            <span className="text-gray-700 group-hover:text-primary-700 transition-colors font-medium">
                                {book}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Show More / Less Button */}
                {books.length > 10 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="inline-flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-6 py-3 rounded-lg font-medium transition-colors border border-primary-200"
                        >
                            {showAll ? (
                                <>
                                    <FaChevronUp className="w-3 h-3" />
                                    সংক্ষেপে দেখুন
                                </>
                            ) : (
                                <>
                                    <FaChevronDown className="w-3 h-3" />
                                    সব গ্রন্থ দেখুন ({books.length}টি)
                                </>
                            )}
                        </button>
                    </div>
                )}

                <p className="text-gray-500 text-sm mt-8 italic border-l-4 border-primary-300 pl-4">
                    ৫৫ লক্ষ টাকার কিতাব নিজ খরচে ছাপিয়ে বিশ্বব্যাপী বিনামূল্যে বিতরণ করে গেছেন।
                </p>
            </div>
        </section>
    );
}
