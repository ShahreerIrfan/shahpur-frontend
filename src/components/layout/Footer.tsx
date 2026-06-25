"use client";

import Link from "next/link";
import { FaFacebook, FaYoutube, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-dark text-gray-300">
            {/* Islamic decorative top border */}
            <div className="h-1 bg-gradient-to-r from-primary-700 via-primary-500 to-primary-700"></div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">শ</span>
                            </div>
                            <h3 className="text-white text-lg font-bold">শাহপুর দরবার শরীফ</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            কুমিল্লার গোমতী নদী তীরবর্তী শাহপুর দরবার শরীফ ইসলামী শরীয়াতের অনুশীলন,
                            কাদেরীয়া তরিকার প্রচার ও আধ্যাত্মিক সাধনার একটি ঐতিহাসিক কেন্দ্র।
                        </p>
                        <div className="flex items-center gap-3.5 mt-4">
                            <a
                                href="https://www.facebook.com/ShahpurDarbarSharif/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-primary-900/40 hover:bg-primary-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-700/50"
                                title="ফেসবুক"
                            >
                                <FaFacebook className="w-4.5 h-4.5" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-lg bg-primary-900/40 hover:bg-primary-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-700/50"
                                title="ইউটিউব"
                            >
                                <FaYoutube className="w-4.5 h-4.5" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-lg bg-primary-900/40 hover:bg-primary-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-700/50"
                                title="টুইটার"
                            >
                                <FaTwitter className="w-4.5 h-4.5" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-lg bg-primary-900/40 hover:bg-primary-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-gray-700/50"
                                title="ইনস্টাগ্রাম"
                            >
                                <FaInstagram className="w-4.5 h-4.5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">দ্রুত লিংক</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm hover:text-primary-400 transition-colors">
                                    হোম
                                </Link>
                            </li>
                            <li>
                                <Link href="/biography/baghdadi" className="text-sm hover:text-primary-400 transition-colors">
                                    আল্লামা ড. বাগদাদী (রাঃ) এঁর জীবনী
                                </Link>
                            </li>
                            <li>
                                <Link href="/biography/subhan" className="text-sm hover:text-primary-400 transition-colors">
                                    মাও. আব্দুস সুবহান (রাঃ) এঁর জীবনী
                                </Link>
                            </li>
                            <li>
                                <Link href="/madrasha" className="text-sm hover:text-primary-400 transition-colors">
                                    মাদ্রাসা
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="text-sm hover:text-primary-400 transition-colors">
                                    ইভেন্ট ও মাহফিল
                                </Link>
                            </li>
                            <li>
                                <Link href="/seva" className="text-sm hover:text-primary-400 transition-colors">
                                    সেবা কার্যক্রম
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">যোগাযোগ</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-1 text-primary-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>শাহপুর শাহপুর দরবার শরীফ-৩৫০০, ওয়ার্ড - ৫, পাঁচথুবি, কুমিল্লা আদর্শ সদর, কুমিল্লা</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>info@shahpurdarbarsharif.org</span>
                            </li>
                        </ul>
                    </div>

                    {/* Islamic Quote */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-lg">পবিত্র বাণী</h3>
                        <div className="bg-dark-light p-4 rounded-lg border border-primary-800">
                            <p className="arabic-text text-gold-light text-center text-lg mb-2">
                                فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي
                            </p>
                            <p className="text-xs text-gray-400 text-center mt-2">
                                &quot;অতঃপর আমার বান্দাদের মধ্যে প্রবেশ কর এবং আমার জান্নাতে প্রবেশ কর।&quot;
                                <br />— সূরা আল-ফাজর (৮৯:২৯-৩০)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} শাহপুর দরবার শরীফ। সর্বস্বত্ব সংরক্ষিত।</p>
                    <p className="mt-2 md:mt-0">
                        ডেভেলপ করেছে: শাহপুর দরবার শরীফ আইটি টিম
                    </p>
                </div>
            </div>
        </footer>
    );
}
