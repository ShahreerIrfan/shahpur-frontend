import { FaBookOpen, FaGlobe, FaHandHoldingHeart, FaHeart, FaPray, FaUsers } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const activities = [
    {
        title: "মাদ্রাসা শিক্ষা",
        description: "প্রায় ৪০টি মাদ্রাসায় দ্বীনি, নৈতিক ও মানবিক শিক্ষার আলো ছড়িয়ে দেওয়া হচ্ছে।",
        icon: <FaBookOpen className="w-4.5 h-4.5" />,
        note: "ইলমের আলো",
    },
    {
        title: "সেবা কার্যক্রম",
        description: "দরিদ্রদের স্বাবলম্বীকরণ, বন্যার্তদের ত্রাণ ও পুনর্বাসন কার্যক্রম।",
        icon: <FaHeart className="w-4.5 h-4.5" />,
        note: "মানবতার পাশে",
    },
    {
        title: "আন্তর্জাতিক দাওয়াত",
        description: "১৭+ দেশে ইসলামের সুমহান বার্তা ও নবীপ্রেমের দাওয়াত পৌঁছে দেওয়া।",
        icon: <FaGlobe className="w-4.5 h-4.5" />,
        note: "বিশ্বময় বার্তা",
    },
    {
        title: "খানকাহ শরীফ",
        description: "বিশ্বের বিভিন্ন দেশে ১৫০+ কাদেরীয়া তরিকার খানকাহ শরীফ প্রতিষ্ঠা।",
        icon: <FaPray className="w-4.5 h-4.5" />,
        note: "আত্মশুদ্ধির কেন্দ্র",
    },
    {
        title: "পীর-মুরীদী",
        description: "কাদেরীয়া তরিকায় বায়াত ও আধ্যাত্মিক প্রশিক্ষণের মাধ্যমে আত্মশুদ্ধি।",
        icon: <FaUsers className="w-4.5 h-4.5" />,
        note: "তরিকতের শিক্ষা",
    },
    {
        title: "কুরবানী ও ইফতার",
        description: "রমজানে ইফতার বিতরণ ও ঈদুল আযহায় কুরবানী কার্যক্রম পরিচালনা।",
        icon: <FaHandHoldingHeart className="w-4.5 h-4.5" />,
        note: "ভ্রাতৃত্বের বন্ধন",
    },
];

// Helper to convert number to Bangla padded string (e.g. 1 -> ০১, 6 -> ০৬)
const toBanglaNumber = (num: number) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const str = num < 10 ? `0${num}` : String(num);
    return str
        .split("")
        .map((digit) => banglaDigits[parseInt(digit)] || digit)
        .join("");
};

export default function ActivitiesSection() {
    return (
        <section className="py-20 bg-[#fbfdfc] relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.06] pointer-events-none"></div>
            <div className="relative max-w-7xl mx-auto px-4">
                <SectionTitle 
                    title="আমাদের কার্যক্রম" 
                    subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত ধর্মীয়, আধ্যাত্মিক ও সমাজসেবামূলক কার্যক্রম" 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                    {activities.map((item, i) => (
                        <div 
                            key={item.title} 
                            className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-[0_12px_30px_rgba(20,50,30,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                {/* Top Row: Soft Green Icon & Soft Green Badge */}
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                        {item.icon}
                                    </div>
                                    <span className="inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-100/50 bg-primary-50/30 text-primary-750">
                                        {item.note}
                                    </span>
                                </div>

                                {/* Content Row */}
                                <div className="pt-1">
                                    <h3 className="text-base font-bold text-gray-800 mb-2 leading-tight group-hover:text-primary-700 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Minimal modern footer with very small font size and full Bangla numbering */}
                            <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold tracking-wider">
                                <span>কার্যক্রম {toBanglaNumber(i + 1)}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-150 group-hover:bg-primary-650 transition-colors"></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
