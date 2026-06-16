import type { Metadata } from "next";
import Image from "next/image";
import { FaGraduationCap, FaGlobe, FaBook, FaAward, FaMosque, FaUniversity, FaPlane, FaMicrophone, FaUsers } from "react-icons/fa";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এঁর জীবনী | শাহপুর দরবার শরীফ",
    description:
        "আন্তর্জাতিক ইসলাম প্রচারক, বিজ্ঞানী ও সুফিসাধক আল্লামা ডঃ শাহজাদা সৈয়দ শেখ আহমদ পেয়ারা বাগদাদী (রাঃ) এর পূর্ণাঙ্গ জীবনী।",
    openGraph: {
        title: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এঁর জীবনী",
        description: "আন্তর্জাতিক ইসলাম প্রচারক, বিজ্ঞানী ও সুফিসাধক",
        type: "article",
    },
};

export default function BaghdadiBiography() {
    return (
        <div className="min-h-screen">
            <Breadcrumbs items={[{ label: "জীবনী", url: "#" }, { label: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এঁর জীবনী" }]} />
            {/* Hero with Background Image */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2000&auto=format')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70"></div>
                <div className="absolute inset-0 islamic-pattern opacity-15"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500"></div>

                <div className="relative max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                        <div className="md:col-span-2">
                            <p className="arabic-text text-primary-600 text-lg mb-4">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-gray-800">
                                আল্লামা ডঃ শাহজাদা সৈয়দ শেখ আহমদ পেয়ারা বাগদাদী (রাঃ)
                            </h1>
                            <div className="flex flex-wrap gap-2 my-4">
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">মেহমানে গাউছুল আজম</span>
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">মুজাদ্দেদে জামান</span>
                                <span className="bg-primary-100 border border-primary-200 px-3 py-1 rounded-full text-sm text-primary-700">আন্তর্জাতিক ইসলাম প্রচারক</span>
                            </div>
                            <p className="text-primary-600 font-medium">৯ ডিসেম্বর ১৯৩৮ — ২৭ ফেব্রুয়ারী ২০০৫</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-primary-300/50 shadow-2xl">
                                <Image
                                    src="/images/ahmed-peyara.jpeg"
                                    alt="আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ)"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-xl bg-primary-50">
                            <FaGraduationCap className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">পিএইচ.ডি</p>
                            <p className="text-xs text-gray-500">Radiation Biology</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50">
                            <FaGlobe className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">১৭+ দেশ</p>
                            <p className="text-xs text-gray-500">ইসলাম প্রচার সফর</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50">
                            <FaBook className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">১৭ কিতাব</p>
                            <p className="text-xs text-gray-500">বহু ভাষায় রচিত</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary-50">
                            <FaMosque className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">১৫০+ খানকাহ</p>
                            <p className="text-xs text-gray-500">বিশ্বব্যাপী প্রতিষ্ঠিত</p>
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
                            আন্তর্জাতিক ইসলাম প্রচারক, বহু ইসলামী গ্রন্থের প্রণেতা, ভাষাবিদ ও বিজ্ঞানী, আশেকে রাসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম,
                            পেদানে পাক পাঞ্জাতান আলাইহিমুস সালাম, জিকিনে রাসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম এঁর প্রবর্তক,
                            মেহমানে গাউছুল আজম (রাঃ), মুজাদ্দেদে জামান, আলহাজ্ব শেখ শাহজাদা সৈয়দ ড. আহমদ পেয়ারা বাগদাদী আল-কাদেরী (রা:)
                            ছিলেন বিশ্বব্যাপী আলোড়ন সৃষ্টিকারী ইসলামী গবেষক ও সূফিসাধক।
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            লক্ষ লক্ষ মুরিদ ভক্তের নয়নমণি, ইরাক বসরা বিশ্ববিদ্যালয়ের প্রাক্তন অধ্যাপক, পীরে কামেল
                            ড. শাহজাদা শেখ আহমদ পেয়ারা বাগদাদী (রাঃ) মহান আধ্যাত্মিক সাধক গাউছুজ্জামান হযরত মাওলানা
                            আবদুছ ছোবহান আল-কাদেরী (রাঃ)-এর দ্বিতীয় ছাহেবজাদা। তাঁর পিতা শাহ আবদুছ ছোবহান আল-কাদেরী (রা:)
                            একজন কামেল মুর্শিদ ও জগত বিখ্যাত আলেম। তিনি দীনের মুজাদ্দেদ ও মক্কা শরীফ থেকে খেতাব প্রাপ্ত শায়খুল কেবারাহ ছিলেন।
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
                            শাহজাদা সৈয়দ শেখ আহমদ পেয়ারা বাগদাদী কুমিল্লা জেলার কোতোয়ালী থানার পাঁচথুবী ইউনিয়নের
                            শাহপুর গ্রামে ১৯৩৮ খ্রিস্টাব্দের ৯ ডিসেম্বর জন্ম গ্রহণ করেন। তিনি মাতৃ ও পিতৃ উভয় কূল থেকে সৈয়দ বংশীয় ছিলেন।
                        </p>
                        <p>
                            তাঁর মূল নাম শাহজাদা আহমদ পেয়ারা। শৈশব থেকে তাঁর আম্মা তাকে বাগদাদী নামে ডাকতেন।
                            পরবর্তীতে তিনি বাগদাদ শরীফ থেকেও &quot;মেহমানে গাউছুল আজম&quot; ও &quot;বাগদাদী&quot; উপাধি লাভ করেন।
                            শৈশব কাল থেকেই মহান আধ্যাত্মিক সাধনা ও খোদাভীরু, নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম এর প্রেম,
                            গাউছে পাক (রাঃ) এঁর প্রেম, মিতভাষী, সংযমী, বিনয়ী, অতিথিপরায়ন, আত্মপ্রত্যয়ী,
                            ন্যায়নিষ্ঠাবান ও কর্তব্যপরায়নতা লক্ষণগুলি প্রকাশ পায়।
                        </p>
                        <p>
                            হযরত আবদুল কাদের জীলানী (রাঃ) এর চার নাতি ইসলাম প্রচারের জন্য বাংলাদেশে আগমন করেন।
                            কুমিল্লার দেবিদ্বার উপজেলার চরবাকর এলাকায় হযরত সৈয়দ বাকের (রাঃ) এর মাজার শরীফ অবস্থিত।
                            হযরত সৈয়দ বাকের (রাঃ) এর বংশে জন্ম গ্রহণ করেন বাগদাদী হুজুরের পিতা গাউছুজ্জামান মাওলানা শাহ আবদুছ ছোবহান আল-কাদেরী (রাঃ)।
                        </p>
                    </div>
                </section>

                {/* Education */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaGraduationCap className="text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">শিক্ষাজীবন ও গবেষণা</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <FaUniversity className="text-primary-600 mb-2" />
                            <h4 className="font-semibold text-gray-800 text-sm">কুমিল্লা জিলা স্কুল</h4>
                            <p className="text-xs text-gray-500">মাধ্যমিক</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <FaUniversity className="text-primary-600 mb-2" />
                            <h4 className="font-semibold text-gray-800 text-sm">নটরডেম কলেজ, ঢাকা</h4>
                            <p className="text-xs text-gray-500">উচ্চ মাধ্যমিক</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <FaUniversity className="text-primary-600 mb-2" />
                            <h4 className="font-semibold text-gray-800 text-sm">বাকৃবি, ময়মনসিংহ</h4>
                            <p className="text-xs text-gray-500">Entomology — অনার্স</p>
                        </div>
                        <div className="bg-gradient-to-br from-gold-light/30 to-white p-5 rounded-xl border border-gold/30 shadow-sm">
                            <FaAward className="text-gold mb-2" />
                            <h4 className="font-semibold text-gray-800 text-sm">Academy of Science, Czechoslovakia</h4>
                            <p className="text-xs text-gray-500">Radiation Biology — <strong>পিএইচ.ডি (বিশ্ব রেকর্ড)</strong></p>
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        তিনি আরবী, বাংলা, ইংরেজি, উর্দু, ফার্সি, হিন্দি ও জাপানি — মোট ৭টি ভাষা জানতেন।
                    </p>
                </section>

                {/* Career */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <FaUniversity className="text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">কর্মজীবন</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            ১৯৭৪ সালে ইরাক সরকার কর্তৃক বাংলাদেশ থেকে প্রফেসর পদে লোক নিয়োগের বিজ্ঞপ্তি দেওয়া হয়। এতে প্রায় দুই হাজার দরখাস্ত পড়ে।
                            তাঁর আম্মাজানের ভবিষ্যদ্বাণী অনুসারে তিনি ইরাকের বসরা বিশ্ববিদ্যালয়ে ১৯৭৪-১৯৭৬ সাল পর্যন্ত অধ্যাপনা করেন।
                            বসরা বিশ্ববিদ্যালয় তাকে তৎকালে ৬০,০০০ টাকা মাসিক বেতন পরিশোধ করত।
                        </p>
                        <p>
                            তদুপরি চাকরির জৌলুসপূর্ণ জীবন ছেড়ে তিনি বড় পীর হযরত আবদুল কাদের জীলানী (রাঃ) এর দরবারে
                            খেদমত ও রিয়াজত সাধনায় চলে আসেন। গাউছে পাকের দরবারে তাঁকে &quot;বাবে শেখ&quot; নামে মাকাম প্রদান করা হয়।
                            দুনিয়া বিমুখ বাগদাদী হুজুর নিজের পরিবারের জন্য একটি ভাল ঘরও তৈরী করে যাননি।
                        </p>
                    </div>
                </section>

                {/* International Dawah */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FaPlane className="text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">বিশ্বব্যাপী ইসলাম প্রচার</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { year: "১৯৮০", title: "আমেরিকায় ১৫০ গির্জার সুপারিনটেনডেন্টকে পরাজিত", desc: "হারভার্ড ইউনিভার্সিটি থেকে ২০০০ বৎসর পূর্বের বাইবেল সংগ্রহ করে প্রমাণ করলেন ইসলাম ধর্মই আল্লাহর মনোনীত ধর্ম। ফিলিপাইনের চারজন বিজ্ঞানী Five Pillars of Islam পড়ে মুসলমান হন।", icon: <FaMicrophone /> },
                            { year: "১৯৮০", title: "জাতিসংঘে ঐতিহাসিক বক্তৃতা", desc: "প্রেসিডেন্ট জিমি কার্টারের আমন্ত্রণে আধ্যাত্মিক নেতা হিসেবে জাতিসংঘে ইসলামের উপর বক্তব্য রাখেন। ডাইরেক্টর কুরআন শরীফ উপহার দেন।", icon: <FaGlobe /> },
                            { year: "১৯৮৮", title: "যুক্তরাজ্যে ঈদে মিলাদুন্নবী কনফারেন্স", desc: "বার্মিংহামে প্রথম ঈদে মিলাদুন্নবী (ﷺ) কনফারেন্সে আখেরী মোনাজাত পরিচালনা করেন।", icon: <FaMosque /> },
                            { year: "১৯৯৫-৯৮", title: "ইরাক ও ওয়াশিংটন ডিসি কনফারেন্স", desc: "ইরাকে হিউম্যান রাইটস কনফারেন্সে বক্তব্য রাখেন। ওয়াশিংটনে ১৫০ বক্তার মধ্যে প্রথম স্থান অধিকার করেন।", icon: <FaPlane /> },
                            { year: "২০০০", title: "সিঙ্গাপুর, দক্ষিণ কোরিয়া ও জাপান", desc: "সিঙ্গাপুরে ২টি খানকা উদ্বোধন। দক্ষিণ কোরিয়া পাজু মসজিদ উদ্বোধন। জাপানে জুমার ইমামতি।", icon: <FaMosque /> },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 text-primary-600">
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{item.year}</span>
                                        <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                        <p className="text-sm text-gray-600">
                            <strong>সফর করা দেশসমূহ:</strong> সৌদি আরব, ইরাক, ইরান, কুয়েত, তুরস্ক, যুক্তরাষ্ট্র, যুক্তরাজ্য,
                            বুলগেরিয়া, চেকোস্লোভাকিয়া, ফ্রান্স, জার্মানি, গ্রীস, হাঙ্গেরি, রুমানিয়া, সিঙ্গাপুর, দক্ষিণ কোরিয়া, ভারত ও জাপান।
                        </p>
                    </div>
                </section>

                {/* Dawah Method */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                            <FaMicrophone className="text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">দাওয়াতি ও বক্তৃতার ধারা</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            বক্তৃতায় &quot;পয়েন্ট ভিত্তিক তাকরীর&quot; পদ্ধতি অনুসরণ করতেন। মূল বিষয়: নবীপ্রেম, শানে মোস্তফা (ﷺ),
                            তাকওয়া, দুনিয়াবিমুখ জীবন, দানশীলতা। তাঁর বক্তব্য শ্রোতাদের হৃদয়ে আলোর সঞ্চার করত।
                        </p>
                        <p>
                            তিনি লিখিত দিয়েছেন যে, &quot;বিধর্মীদের জন্য তাবলীগ, আর মুসলমানদের জন্য তা&apos;লিম&quot;।
                            আমেরিকান মুসলিম মিশনের নেতা ইমাম ওয়ারিদ দীন মুহাম্মদ যাঁর হাতে ১০ লক্ষ খৃস্টান মুসলমান
                            হয়েছেন তাঁর সাথে সৈয়দ ড. আহমদ পেয়ারা বাগদাদী (রা:) বোস্টন মসজিদে ধর্মীয় নীতি মালার উপর গুরুত্বপূর্ণ আলোচনা করেছেন।
                        </p>
                    </div>
                </section>

                {/* Books */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center">
                            <FaBook className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">রচিত গ্রন্থসমূহ</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Five Pillars of Islam", "Light Upon Light", "Marriage of Muhammad (ﷺ)", "Marriage of Prophets",
                            "Prophet's Love", "Arrival of Prophet Muhammad (ﷺ)", "Magnanimity of Muhammad (ﷺ) in the Holy Quran",
                            "Allah is the Light: From Heaven to Earth", "Heart & Soul", "নূরুন্নবী (ﷺ) শুভাগমন",
                            "নবী প্রেম", "নূরের জিকির", "কল্ব ও আত্মা", "শোগলে কল্ব", "বায়াতের দলিল",
                            "ইয়া পাক পাঞ্জাতান (আ.) লাখো সালাম", "Prophets of Islam",
                        ].map((book, i) => (
                            <div key={i} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                                <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                <FaBook className="w-6 h-6 text-primary-500 shrink-0" />
                                <span className="text-gray-700 group-hover:text-primary-700 transition-colors font-medium">{book}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-6 italic border-l-4 border-primary-300 pl-4">
                        বিশ্বে আলোড়ন সৃষ্টিকারী এসব কিতাব পড়ে সারা বিশ্বে অসংখ্য বিধর্মী মুসলমান হয়েছেন।
                        তিনি জীবদ্দশায় ৫৫ লক্ষ টাকার কিতাব নিজ খরচে ছাপিয়ে বিনামূল্যে বিতরণ করেছেন।
                        জীবনের শেষ গাড়িটিও বিক্রি করে বই ছেপে দান করে যান।
                    </p>
                </section>

                {/* Khilafat */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                            <FaMosque className="text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">খেলাফত ও আধ্যাত্মিক মর্যাদা</h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p>
                            শরীয়তের কঠোর অনুসারী বাগদাদী হুজুর তাঁর পিতা এবং হযরত আবদুল কাদের জীলানী (রা) এর দরবার
                            মোতাওয়াল্লী আল্লামা সৈয়দ ইউসুফ আল-জীলানী হতে খেলাফত প্রাপ্ত হন। পরবর্তী মোতাওয়াল্লী সৈয়দ আবদুর
                            রহমান আল-জীলানীও তাঁকে খেলাফত প্রদান করেন। এছাড়াও বাগদাদ শরীফের ৩৩জন কুতুব/খাদেম হুজুরকে বরকতান খেলাফত দান করেন।
                        </p>
                        <p>
                            তিনি দীর্ঘ ২৬ বৎসর পীর মুরীদীর দায়িত্ব পালন করে বাংলাদেশসহ বিশ্বের বিভিন্ন দেশে প্রায় ১৫০টির
                            বেশী কাদেরীয়া তরিকার খানকাহ শরীফ (আধ্যাত্মিক কেন্দ্র) প্রতিষ্ঠা করেন।
                            তিনি ছোবহানিয়া ইসলামিক সেন্টার-এর প্রতিষ্ঠাতা চেয়ারম্যান ছিলেন।
                            বাংলাদেশ ইসলামী ফ্রন্টের প্রেসিডিয়াম মেম্বার ছিলেন।
                        </p>
                    </div>
                </section>

                {/* Wafat */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FaMosque className="text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">ইন্তেকাল</h2>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                        <p className="text-gray-700 leading-relaxed mb-4">
                            ১৯৮০ সালে কুমিল্লা শাহপুর দরবার শরীফের পীরের দায়িত্বভার গ্রহণ করে ২০০৫ সাল পর্যন্ত আধ্যাত্মিক খিদমতে আঞ্জাম দেন।
                            তিনি ২৭ ফেব্রুয়ারী ২০০৫, ১৭ মুহররম ১৪২৬ হিজরী, সোমবার শাহ আবদুল্লাহ কাদেরী (রা) এর মাজার
                            জিয়ারত করে দরূদ শরীফ পড়তে পড়তে সন্ধ্যা ৬:১১ মিনিটে ইন্তেকাল করেন।
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            কুমিল্লার ইতিহাসের সর্ববৃহৎ মুসল্লী সমাগম হয়েছিল হুজুরের জানাযায়। জানাজার সময়
                            লাখো মুসল্লীর ঢল নামলে গোমতী নদীর খেয়া নৌকায় পারাপার সংকুলান না হওয়ায়
                            অলৌকিকভাবে নদী শুকিয়ে পথ হয়ে যায় — এ ঘটনা সর্বজনবিদিত।
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            কুমিল্লা সদর উপজেলার পাঁচথুবী ইউনিয়নের শাহপুর গ্রামে গোমতী নদীর তীরে হুজুরের মায়ের কদমের
                            নিচে মাজার শরীফ অবস্থিত। ইন্তেকালের পরও মক্কা শরীফে তাওয়াফরত অবস্থায় ও মাহফিলে ওয়াজরত অবস্থায়
                            এবং বিভিন্ন মাজার জিয়ারত অবস্থায় স্বশরীরে অনেকে তাঁকে দেখেছেন এবং কথাও বলেছেন।
                        </p>
                    </div>
                </section>

                {/* Successor */}
                <section>
                    <div className="bg-primary-50 p-6 rounded-2xl border border-primary-200">
                        <h3 className="text-lg font-bold text-primary-800 mb-3">খেলাফত ও উত্তরসূরি</h3>
                        <p className="text-gray-700 leading-relaxed">
                            তিনি ইন্তেকালের পূর্বে তার একমাত্র শাহজাদা শেখ সৈয়দ গোলাম মুহাম্মদ আবদুল কাদের কাওকাব আল-কাদেরী
                            কে খেলাফত প্রদান করে যান। বর্তমানে তিনি দরবারের পীর ও আধ্যাত্মিক দায়িত্ব পালন করছেন।
                        </p>
                    </div>
                </section>
            </article>
        </div>
    );
}
