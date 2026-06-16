import { FaMosque, FaQuran, FaHandsHelping, FaGlobeAsia } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
    { icon: <FaMosque className="w-6 h-6" />, title: "দরবার শরীফ", desc: "আধ্যাত্মিক সাধনার ঐতিহাসিক কেন্দ্র" },
    { icon: <FaQuran className="w-6 h-6" />, title: "কাদেরীয়া তরিকা", desc: "হযরত আব্দুল কাদের জীলানী (রা) এর ধারা" },
    { icon: <FaHandsHelping className="w-6 h-6" />, title: "মানবসেবা", desc: "দরিদ্র ও অসহায়দের পাশে দাঁড়ানো" },
    { icon: <FaGlobeAsia className="w-6 h-6" />, title: "বিশ্বব্যাপী", desc: "১৭+ দেশে ইসলাম প্রচার কার্যক্রম" },
];

export default function AboutSection() {
    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative max-w-7xl mx-auto px-4">
                <SectionTitle title="দরবার শরীফ সম্পর্কে" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-8">
                    <div>
                        <p className="text-gray-600 leading-relaxed text-lg mb-6">
                            বাংলাদেশের সুফি দরবেশদের ইতিহাসে কুমিল্লার শাহপুর দরবার শরীফ একটি উজ্জল নাম।
                            গোমতী নদীর উত্তর পাড় ঘেঁষে পাঁচথুবী ইউনিয়নের সীমান্তবর্তী গ্রাম শাহপুর।
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার, আত্মশুদ্ধি, কঠোর রিয়াজত,
                            আধ্যাত্মিক শিক্ষা সাধনার জন্য শাহপুর দরবার শরীফ অত্যন্ত পরিচিত।
                            দেশ বিদেশে রয়েছে এ দরবারের লক্ষ লক্ষ আশেক-ভক্ত-মুরিদ।
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            শাহপুর দরবার শরীফ কর্তৃক প্রতিষ্ঠিত জিকরুল্লাহ ইসলামিয়া কমিটির উদ্যোগে দরিদ্রদের স্বাবলম্বী করণ,
                            বন্যার্তদের ত্রাণ ও পুনর্বাসন, শীতবস্ত্র ও ইফতার বিতরণসহ বিভিন্ন মানবসেবামূলক কার্যক্রম পরিচালিত হচ্ছে।
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="bg-gradient-to-br from-primary-50 to-white p-5 rounded-xl border border-primary-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="text-primary-600 mb-3">{f.icon}</div>
                                <h4 className="font-semibold text-gray-800 mb-1">{f.title}</h4>
                                <p className="text-sm text-gray-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
