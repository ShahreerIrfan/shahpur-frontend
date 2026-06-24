import { FaFeatherAlt, FaGlobeAsia, FaHandsHelping, FaMapMarkerAlt, FaMosque, FaQuran, FaStarAndCrescent } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
    { icon: <FaMosque className="w-5 h-5" />, title: "দরবার শরীফ", desc: "আধ্যাত্মিক সাধনার ঐতিহাসিক কেন্দ্র" },
    { icon: <FaQuran className="w-5 h-5" />, title: "কাদেরীয়া তরিকা", desc: "গাউছে পাক (রাঃ)-এর সিলসিলার ধারা" },
    { icon: <FaHandsHelping className="w-5 h-5" />, title: "মানবসেবা", desc: "দরিদ্র ও অসহায় মানুষের পাশে থাকা" },
    { icon: <FaGlobeAsia className="w-5 h-5" />, title: "বিশ্বব্যাপী দাওয়াত", desc: "দেশ-বিদেশে নবীপ্রেমের বার্তা" },
];

const stats = [
    { value: "৪০+", label: "মাদ্রাসা" },
    { value: "১৫০+", label: "খানকাহ" },
    { value: "১৭+", label: "দেশ সফর" },
];

export default function AboutSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.35] pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-50 rounded-full -translate-x-1/3 translate-y-1/3"></div>

            <div className="relative max-w-7xl mx-auto px-4">
                <SectionTitle title="দরবার শরীফ সম্পর্কে" subtitle="কুমিল্লার শাহপুরে ইসলামী শরীয়াত, কাদেরীয়া তরিকা ও আধ্যাত্মিক সাধনার ঐতিহাসিক কেন্দ্র" />

                <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-10 items-stretch">
                    <div className="relative rounded-[32px] bg-gradient-to-br from-primary-950 via-primary-850 to-primary-700 p-[1px] shadow-2xl shadow-primary-950/15 overflow-hidden">
                        <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative h-full rounded-[31px] bg-white p-7 md:p-9">
                            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-800 px-4 py-2 rounded-full text-xs font-extrabold mb-6">
                                <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                শাহপুর, কুমিল্লা
                            </div>

                            <div className="space-y-5 text-gray-650 leading-loose">
                                <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                                    বাংলাদেশের সুফি দরবেশদের ইতিহাসে কুমিল্লার শাহপুর দরবার শরীফ একটি উজ্জ্বল নাম। গোমতী নদীর উত্তর পাড় ঘেঁষে পাঁচথুবী ইউনিয়নের সীমান্তবর্তী গ্রাম শাহপুরে এই দরবারের অবস্থান।
                                </p>
                                <p>
                                    ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার, আত্মশুদ্ধি, কঠোর রিয়াজত ও আধ্যাত্মিক শিক্ষা সাধনার জন্য শাহপুর দরবার শরীফ দেশ-বিদেশে সুপরিচিত। লক্ষ লক্ষ আশেক, ভক্ত ও মুরিদের হৃদয়ে এই দরবার নবীপ্রেমের আলোকবর্তিকা।
                                </p>
                                <p>
                                    জিকরুল্লাহ ইসলামিয়া কমিটির উদ্যোগে দরিদ্রদের স্বাবলম্বীকরণ, বন্যার্তদের ত্রাণ ও পুনর্বাসন, শীতবস্ত্র, কুরবানী ও ইফতার বিতরণসহ মানবসেবামূলক কার্যক্রম পরিচালিত হচ্ছে।
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-8">
                                {stats.map((item) => (
                                    <div key={item.label} className="rounded-2xl bg-gradient-to-b from-primary-50 to-white border border-primary-100 p-4 text-center shadow-sm">
                                        <div className="text-2xl font-black text-primary-700">{item.value}</div>
                                        <div className="text-xs text-gray-500 font-bold mt-1">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((item, i) => (
                            <div key={item.title} className="group relative rounded-2xl bg-white border border-primary-100 p-6 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm mb-5">
                                        {item.icon}
                                    </div>
                                    <h4 className="font-extrabold text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                                <span className="absolute bottom-5 right-5 text-xs font-black text-primary-200">0{i + 1}</span>
                            </div>
                        ))}

                        <div className="sm:col-span-2 rounded-3xl bg-gradient-to-r from-primary-700 to-primary-950 p-6 text-white relative overflow-hidden">
                            <FaStarAndCrescent className="absolute right-6 top-6 w-16 h-16 text-white/10" />
                            <div className="relative flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                                    <FaFeatherAlt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-lg mb-2">নবীপ্রেম, আত্মশুদ্ধি ও মানবতার সেবা</h4>
                                    <p className="text-sm text-white/75 leading-relaxed">দরবার শরীফের মূল শিক্ষা হলো শরীয়াতের অনুশীলন, সুন্নাহর অনুসরণ, আত্মিক পরিশুদ্ধি এবং মানুষের কল্যাণে নিবেদিত জীবন।</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
