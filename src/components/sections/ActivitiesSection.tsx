import { FaBookOpen, FaGlobe, FaHandHoldingHeart, FaHeart, FaPray, FaUsers } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const activities = [
    {
        title: "মাদ্রাসা শিক্ষা",
        description: "প্রায় ৪০টি মাদ্রাসায় দ্বীনি, নৈতিক ও মানবিক শিক্ষার আলো ছড়িয়ে দেওয়া হচ্ছে।",
        icon: <FaBookOpen className="w-6 h-6" />,
        color: "bg-emerald-600",
        border: "border-emerald-100",
        line: "bg-emerald-600",
        note: "ইলমের আলো",
    },
    {
        title: "সেবা কার্যক্রম",
        description: "দরিদ্রদের স্বাবলম্বীকরণ, বন্যার্তদের ত্রাণ ও পুনর্বাসন কার্যক্রম।",
        icon: <FaHeart className="w-6 h-6" />,
        color: "bg-rose-600",
        border: "border-rose-100",
        line: "bg-rose-600",
        note: "মানবতার পাশে",
    },
    {
        title: "আন্তর্জাতিক দাওয়াত",
        description: "১৭+ দেশে ইসলামের সুমহান বার্তা ও নবীপ্রেমের দাওয়াত পৌঁছে দেওয়া।",
        icon: <FaGlobe className="w-6 h-6" />,
        color: "bg-blue-600",
        border: "border-blue-100",
        line: "bg-blue-600",
        note: "বিশ্বময় বার্তা",
    },
    {
        title: "খানকাহ শরীফ",
        description: "বিশ্বের বিভিন্ন দেশে ১৫০+ কাদেরীয়া তরিকার খানকাহ শরীফ প্রতিষ্ঠা।",
        icon: <FaPray className="w-6 h-6" />,
        color: "bg-violet-600",
        border: "border-violet-100",
        line: "bg-violet-600",
        note: "আত্মশুদ্ধির কেন্দ্র",
    },
    {
        title: "পীর-মুরীদী",
        description: "কাদেরীয়া তরিকায় বায়াত ও আধ্যাত্মিক প্রশিক্ষণের মাধ্যমে আত্মশুদ্ধি।",
        icon: <FaUsers className="w-6 h-6" />,
        color: "bg-amber-600",
        border: "border-amber-100",
        line: "bg-amber-600",
        note: "তরিকতের শিক্ষা",
    },
    {
        title: "কুরবানী ও ইফতার",
        description: "রমজানে ইফতার বিতরণ ও ঈদুল আযহায় কুরবানী কার্যক্রম পরিচালনা।",
        icon: <FaHandHoldingHeart className="w-6 h-6" />,
        color: "bg-sky-600",
        border: "border-sky-100",
        line: "bg-sky-600",
        note: "ভ্রাতৃত্বের বন্ধন",
    },
];

export default function ActivitiesSection() {
    return (
        <section className="py-24 bg-[#f7faf8] relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.16] pointer-events-none"></div>
            <div className="relative max-w-7xl mx-auto px-4">
                <SectionTitle title="আমাদের কার্যক্রম" subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত ধর্মীয়, আধ্যাত্মিক ও সমাজসেবামূলক কার্যক্রম" />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                    {activities.map((item, i) => (
                        <div key={item.title} className={`group bg-white rounded-2xl border ${item.border} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden`}>
                            <div className={`h-1 ${item.line}`}></div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="inline-flex text-[11px] font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full mb-3">{item.note}</span>
                                        <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400">কার্যক্রম {i + 1}</span>
                                    <span className={`h-1.5 w-12 rounded-full ${item.line}`}></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
