import Link from "next/link";
import { FaBookOpen, FaMosque } from "react-icons/fa";

export default function HeroSection() {
    return (
        <section className="relative min-h-[580px] flex items-center overflow-hidden">
            {/* Background image with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2000&auto=format')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60"></div>
            <div className="absolute inset-0 islamic-pattern opacity-20"></div>

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
                <div className="max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-300/40">
                        <FaMosque className="text-primary-600" />
                        <span className="text-sm text-primary-700 font-medium">আধ্যাত্মিক সাধনার কেন্দ্র</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-800">
                        শাহপুর দরবার <br />
                        <span className="text-primary-600">শরীফ</span>
                    </h1>

                    <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                        কুমিল্লার গোমতী নদী তীরবর্তী ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার
                        ও আধ্যাত্মিক সাধনার ঐতিহাসিক কেন্দ্র
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            href="/biography/baghdadi"
                            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 shadow-lg shadow-primary-500/20"
                        >
                            <FaBookOpen />
                            বাগদাদী হুজুর (রাঃ) এঁর জীবনী
                        </Link>
                        <Link
                            href="/biography/subhan"
                            className="inline-flex items-center gap-2 border-2 border-primary-300 hover:bg-primary-50 text-primary-700 px-6 py-3 rounded-lg font-medium transition-all"
                        >
                            মাও. আব্দুস সুবহান (রাঃ)
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 pt-4">
                        <div>
                            <p className="text-3xl font-bold text-primary-600">৪০+</p>
                            <p className="text-sm text-gray-500">মাদ্রাসা</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary-600">১৫০+</p>
                            <p className="text-sm text-gray-500">খানকাহ শরীফ</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary-600">১৭+</p>
                            <p className="text-sm text-gray-500">দেশ সফর</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
