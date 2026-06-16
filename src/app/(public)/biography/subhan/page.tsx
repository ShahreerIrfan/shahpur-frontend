import type { Metadata } from "next";
import { FaAward, FaBookOpen, FaBriefcase, FaGlobeAsia, FaHeart, FaMosque, FaPray, FaStar, FaUsers, FaShieldAlt } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এঁর জীবনী | শাহপুর দরবার শরীফ",
    description:
        "শাহপুর দরবার শরীফের প্রতিষ্ঠাতা শায়খুল কুররা গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এর পূর্ণাঙ্গ জীবনী।",
    openGraph: {
        title: "মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এঁর জীবনী",
        description: "শাহপুর দরবার শরীফের প্রতিষ্ঠাতা - গাউছে জামান",
        type: "article",
    },
};

export default function SubhanBiography() {
    return (
        <div className="min-h-screen">
            <Breadcrumbs items={[{ label: "জীবনী", url: "#" }, { label: "মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এঁর জীবনী" }]} />
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597075903824-7f8c0089e870?q=80&w=2000&auto=format')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70"></div>
                <div className="absolute inset-0 islamic-pattern opacity-15"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>

                <div className="relative max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                        <div className="md:col-span-2">
                            <p className="arabic-text text-primary-600 text-lg mb-3">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
                                শায়খুল কুররা গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ)
                            </h1>
                            <div className="flex flex-wrap gap-2 my-4">
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">মোজাদ্দেদে জামান</span>
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">আলহাজ্ব গাজী শাহসুফি</span>
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">দরবার শরীফের প্রতিষ্ঠাতা</span>
                            </div>
                            <p className="text-primary-600 font-medium">১৮৭৬ — ৩ মার্চ ১৯৫৫ ঈসায়ী</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-primary-300/50 shadow-xl bg-primary-100 flex items-center justify-center">
                                <span className="text-6xl font-bold text-primary-400">আ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-xl bg-primary-50 border border-primary-100">
                            <FaPray className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">শায়খুল কুররা</p>
                            <p className="text-xs text-gray-500">হেরেম শরীফ থেকে প্রাপ্ত</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50 border border-primary-100">
                            <FaGlobeAsia className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">১০ বছর</p>
                            <p className="text-xs text-gray-500">বিদেশ সফর ও রিয়াজত</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50 border border-primary-100">
                            <FaBookOpen className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">৫ ভাষা</p>
                            <p className="text-xs text-gray-500">উর্দু, বাংলা, আরবি ও আরো</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50 border border-primary-100">
                            <FaShieldAlt className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">গাজী</p>
                            <p className="text-xs text-gray-500">প্রথম বিশ্বযুদ্ধ ১৯১৭</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <article className="max-w-5xl mx-auto px-4 py-16">
                {/* Introduction */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FaAward className="text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">সংক্ষিপ্ত পরিচিতি</h2>
                    </div>
                    <div className="bg-gradient-to-r from-primary-50 to-white p-6 rounded-2xl border border-primary-100">
                        <p className="text-gray-700 leading-relaxed mb-4">
                            বাংলাদেশের সুফি দরবেশদের ইতিহাসে কুমিল্লার শাহপুর দরবার শরীফ একটি উজ্জল নাম।
                            গোমতী নদীর উত্তর পাড় ঘেঁষে পাঁচথুবী ইউনিয়নের সীমান্তবর্তী গ্রাম শাহপুর।
                            ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার, আত্মশুদ্ধি, কঠোর রিয়াজত,
                            আধ্যাত্মিক শিক্ষা সাধনার জন্য শাহপুর দরবার শরীফ অত্যন্ত পরিচিত।
                            দেশ বিদেশে রয়েছে এ দরবারের লক্ষ লক্ষ আশেক-ভক্ত-মুরিদ।
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            হযরত নুরুদ্দীন বন্দীশাহ (রা) এর আশেক ও ভক্ত মাওলানা আব্দুস সোবহান আল-কাদেরী (রা) এখানে
                            রিয়াজত সাধনা করতেন এবং শরীয়ত তরিকত চর্চার অন্যতম আধ্যাত্মিক কেন্দ্র শাহপুর দরবার শরীফ প্রতিষ্ঠা করেন।
                        </p>
                    </div>
                </section>

                {/* Shahpur History */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <FaMosque className="text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">শাহপুরের ইতিহাস</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            হযরত নুরুদ্দীন শাহ (রা) নামে একজন মহান জ্ঞান তাপস ভারতের বিহার রাজ্যের ভাগলপুর জেলায়
                            জন্ম নিয়েছিলেন। উনার পূর্ব পুরুষগণ আরব অঞ্চল থেকে বিহারে হিজরত করেন। তিনি ত্রিপুরা অঞ্চলে
                            ইসলাম প্রচার করেন।
                        </p>
                        <p>
                            হযরত নুরুদ্দীন শাহ (রা) একবার বিনা অপরাধে বন্দী হয়েছিলেন এবং জেলখানায়
                            তাঁর অনেক অলৌকিক কারামত প্রকাশ পায়। এজন্য তাকে বন্দীশাহ (রা) বলা হয়।
                            এ সাধক বন্দীশাহ বর্তমান শাহপুর অঞ্চলে আগমন করলে উনার নাম অনুসারে এলাকার নাম হয় &quot;শাহপুর&quot;।
                            শাহপুর দরবার শরীফে বকুল তলে হযরত নুরুদ্দীন বন্দীশাহ (রা) এর পবিত্র মাজার অবস্থিত।
                        </p>
                    </div>
                </section>

                {/* Birth */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">জন্ম ও বংশ পরিচয়</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            শাইখুল কুররাহ গাউছে জামান মোজাদ্দেদে জামান আলহাজ্ব গাজী শাহসুফি আব্দুস সোবহান আল কাদেরী (রা)-র
                            জন্ম ১৮৭৬ ইংরেজী। পিতার নাম হযরত সাইয়েদ মীর কাসেম আলী, মাতা হযরত সৈয়দা জোহরা খাতুন, চাঁন্দপুর কুমিল্লা।
                        </p>
                        <p>
                            বাংলার জমিনে ইসলাম প্রচার ও প্রসারের উদ্দেশ্যে পীরানে পীর মাহবুবে সোবহানী সাইয়্যেদেনা হযরত বড় পীর
                            মহিউদ্দিন আব্দুল কাদের জিলানী (রা) এর শাহজাদাগণের মধ্যে পাঁচজন নাতি মোগল আমলে বহু পথ পরিক্রমা
                            অতিক্রম করে ভারত বর্ষ হয়ে বাংলাদেশে আগমন করেন।
                        </p>
                    </div>
                </section>

                {/* Education */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaBookOpen className="text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">শিক্ষা জীবন</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            বাবা মায়ের কাছে প্রাথমিক শিক্ষা লাভের পর প্রাতিষ্ঠানিক শিক্ষার জন্য তিনি কুমিল্লা শহরে
                            হুচ্ছামিয়া সিনিয়র মাদ্রাসায় ভর্তি হন। তিনি তার কঠোর অধ্যবসায় দ্বারা শিক্ষাজীবনে
                            মাদ্রাসার সব শ্রেণীর পরীক্ষায় কৃতিত্বের সাথে উত্তীর্ণ হন। পাঁচটি ভাষা জানতেন।
                        </p>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">রচিত গ্রন্থসমূহ:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["কাসিদায়ে সোবহান", "শোগলে কাদেরী", "দরশে দেল", "মহাসফর", "কেরাত শিক্ষা", "মৌলুদ শরীফ"].map((book, i) => (
                                <div key={i} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                                    <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                    <FaBookOpen className="w-6 h-6 text-primary-500 shrink-0" />
                                    <span className="text-gray-700 group-hover:text-primary-700 transition-colors font-medium text-sm">{book}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Hajj & Travel */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FaGlobeAsia className="text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">হজ্ব পালন ও বিদেশ সফর</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            মায়ের অনুমতি নিয়ে এই মহান সুফিসাধক আল্লাহ তালার উপর পরিপূর্ণ তাওয়াক্কুল করে
                            মাত্র ২৩ টাকা নিয়ে পবিত্র হজ পালনের উদ্দেশ্যে রওনা হন এবং হজ কার্যক্রম সম্পূর্ণ করেন।
                        </p>
                        <p>
                            এরপর দীর্ঘ ১০ বছর সময় মক্কা, মদিনা, ইরাক, মিশর, ও ভারত উপমহাদেশসহ বিভিন্ন স্থান ভ্রমণ করেন।
                            হেরেম শরীফের ওস্তাদদের নিকট থেকে শায়খ-উল-কুররা ডিগ্রি লাভ করেন।
                        </p>
                    </div>
                </section>

                {/* Spiritual Life */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FaPray className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">আধ্যাত্মিক সাধনা</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        তিনি তৎকালীন প্রখ্যাত সুফি সাধক শাহ আব্দুল আজিজ (রা) এর কাছে জ্ঞান অর্জন করেন এবং আধ্যাত্মিক সাধনায় নিজেকে নিয়োজিত করেন।
                        আজমীর শরীফে সুলতানুল হিন্দ খাজা মঈনুদ্দিন চিশতি (রা), দিল্লিতে হযরত খাজা নিজামুদ্দিন (রা) সহ অনেক আউলিয়া কেরামের জিয়ারত করেন।
                    </p>
                    <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
                        <h4 className="font-semibold text-primary-800 mb-3">কঠোর চিল্লা (আধ্যাত্মিক সাধনা):</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                "এক কেজি চনা বুট খেয়ে ৪০ দিন অতিবাহিত",
                                "সাতটি লাং দ্বারা ৪০ দিনের চিল্লা",
                                "লবণ-তেল-মসলা বিহীন কচু শাকের সিদ্ধ পানি খেয়ে ৬ মাসের চিল্লা",
                                "দিবারাত্র কোরআন তেলাওয়াত ও জিকিরে নিমগ্ন",
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <FaStar className="text-primary-500 mt-1 shrink-0 w-3 h-3" />
                                    <span className="text-sm text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gazi */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FaShieldAlt className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">যেভাবে গাজী হলেন</h2>
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                        <p>
                            হযরত মাওলানা আব্দুস সোবহান রাদিউল্লাহ একজন মুজাদ্দেদে জামান ছিলেন। ব্রিটিশদের বিরুদ্ধে
                            যুদ্ধ করার জন্য ১৯১৭ সালে প্রথম মহাযুদ্ধে তুরস্কের পক্ষে যুদ্ধ করেন। ব্রিটিশ বন্দীশালায়
                            মৃত্যুদণ্ডপ্রাপ্ত হয়ে বধভূমিতে দণ্ড দেয়ার জন্য নিয়ে যাওয়া হয়। তার বিরুদ্ধে আনীত
                            দণ্ডলিপি অলৌকিকভাবে নিখোঁজ হয়ে যায় এবং তিনি রক্ষা পান।
                        </p>
                    </div>
                </section>

                {/* Miracles */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FaStar className="text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">কারামত সমূহ</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: "হযরত আবদুল কাদের জীলানী (রা) এর সাক্ষাৎ", desc: "আরবে মরুভূমির চোরাবালিতে গাধা পড়ে গেলে 'ইয়া গাউছে পাক' বলার সাথে সাথে জ্যোতির্ময় ব্যক্তি ঘোড়ায় এসে উদ্ধার করেন।" },
                            { title: "হযরত খিজির (আঃ) এর সাথে সাক্ষাৎ", desc: "নদীর তীরে মনে মনে ইচ্ছা করতেই সাদা পোশাক পরিহিত সুন্দর বৃদ্ধ এসে একসাথে আহার করলেন এবং মুহূর্তে অদৃশ্য হয়ে গেলেন।" },
                            { title: "মৃত ব্যক্তিকে জীবিত করা", desc: "লাল মিয়া ওস্তাদ সাপে কামড়ে মারা গেলে জানাজার পর কবরে নেওয়ার সময় চিৎকার দিয়ে জীবিত হয়ে উঠেন — এরপর আরো ১৫ বছর জীবিত ছিলেন।" },
                            { title: "ট্রেনের নিচ থেকে উদ্ধার", desc: "লাকসাম স্টেশনে ট্রেনের নিচে পড়া ব্যক্তির মাথায় হাত দিয়ে চাপ দিয়ে বললেন 'মাথা উঠিও না' — ট্রেন চলে গেলে তিনি সম্পূর্ণ অক্ষত বেঁচে যান।" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
                                    <FaStar className="text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Social Service */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <FaHeart className="text-pink-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">সমাজ সেবা</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            সমাজে মুসলমানরা মাছ ধরা, চুলকাটা, পান চাষ ও বিক্রি করাকে হেও চোখে দেখত।
                            হুজুর নিজে তাদেরকে এসব পেশায় নিয়োজিত করে ব্যবসায় সুন্নতের অনুসারী করেন।
                            এতে অনেক দরিদ্র শ্রেণীর লোক সফল ও বিত্তবান হয়ে ওঠেন।
                        </p>
                        <p>
                            শিক্ষা বিস্তারে সমাজকে উৎসাহিত করে স্বাবলম্বী জীবন যাপনের নির্দেশ ও উৎসাহ দিতেন।
                            মদিনার মডেলের মুসলিম রাষ্ট্র প্রতিষ্ঠার জন্য বহু পরিশ্রম করেন।
                        </p>
                    </div>
                </section>

                {/* Career */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <FaBriefcase className="text-cyan-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">কর্ম জীবন</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        হযরত শাহ আব্দুস সোবহান আল কাদেরী (রাঃ) চাঁনপুর জেলার জামরাবাদ মাদ্রাসায় এবং কুমিল্লা
                        ইউসুফ হাই স্কুলে শিক্ষকতা করেন। তার পিতার ইন্তেকালের পর মায়ের সেবা এবং একমাত্র ছোট
                        বোনের বিবাহ — ভাইদের প্রতি দায়দায়িত্ব তিনি পালন করেন।
                    </p>
                </section>

                {/* Wafat */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaMosque className="text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">ওফাত</h2>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                        <p className="text-gray-700 leading-relaxed mb-4">
                            আল্লাহ প্রদত্ত সব দায়িত্ব পরিপূর্ণভাবে পালন করার পর গাউছে জামান হযরত শাহ আব্দুস সোবহান আল কাদেরী পৃথিবী থেকে বিদায় নেন।
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            <strong>১৯৫৫ সালের ৩ মার্চ বৃহস্পতিবার রাত নয়টায়</strong> তিনি পরলোক গমন করেন।
                            উপস্থিত স্বজনদের সাক্ষ্য অনুসারে মৃত্যুকালে তার মুখ থেকে এক টুকরা উজ্জ্বল আলোকপিণ্ড বের হয়ে যায়।
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            প্রতিবছর নির্দিষ্ট তারিখের সম্পূর্ণ শরীয়ত সম্মত ভাবে শাহ আব্দুস সুবহান আল কাদেরী (রাঃ) এর
                            বার্ষিক উরুশ শরীফ কুমিল্লার শাহপুর দরবার শরীফে অনুষ্ঠিত হয়।
                        </p>
                    </div>
                </section>
            </article>
        </div >
    );
}
