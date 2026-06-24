import { FaBookOpen, FaGlobe, FaHandHoldingHeart, FaHeart, FaPray, FaUsers } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const activities = [
    {
        title: "মাদ্রাসা শিক্ষা",
        description: "প্রায় ৪০টি মাদ্রাসায় দ্বীনি, নৈতিক ও মানবিক শিক্ষার আলো ছড়িয়ে দেওয়া হচ্ছে।",
        icon: <FaBookOpen className="w-6 h-6" />,
        color: "from-emerald-600 to-teal-500",
        note: "ইলমের আলো",
    },
    {
        title: "সেবা কার্যক্রম",
        description: "দরিদ্রদের স্বাবলম্বীকরণ, বন্যার্তদের ত্রাণ ও পুনর্বাসন কার্যক্রম।",
        icon: <FaHeart className="w-6 h-6" />,
        color: "from-rose-600 to-pink-500",
        note: "মানবতার পাশে",
    },
    {
        title: "আন্তর্জাতিক দাওয়াত",
        description: "১৭+ দেশে ইসলামের সুমহান বার্তা ও নবীপ্রেমের দাওয়াত পৌঁছে দেওয়া।",
        icon: <FaGlobe className="w-6 h-6" />,
        color: "from-blue-600 to-indigo-500",
        note: "বিশ্বময় বার্তা",
    },
    {
        title: "খানকাহ শরীফ",
        description: "বিশ্বের বিভিন্ন দেশে ১৫০+ কাদেরীয়া তরিকার খানকাহ শরীফ প্রতিষ্ঠা।",
        icon: <FaPray className="w-6 h-6" />,
        color: "from-purple-600 to-violet-500",
        note: "আত্মশুদ্ধির কেন্দ্র",
    },
    {
        title: "পীর-মুরীদী",
        description: "কাদেরীয়া তরিকায় বায়াত ও আধ্যাত্মিক প্রশিক্ষণের মাধ্যমে আত্মশুদ্ধি।",
        icon: <FaUsers className="w-6 h-6" />,
        color: "from-amber-600 to-orange-500",
        note: "তরিকতের শিক্ষা",
    },
    {
        title: "কুরবানী ও ইফতার",
        description: "রমজানে ইফতার বিতরণ ও ঈদুল আযহায় কুরবানী কার্যক্রম পরিচালনা।",
        icon: <FaHandHoldingHeart className="w-6 h-6" />,
        color: "from-cyan-600 to-sky-500",
        note: "ভ্রাতৃত্বের বন্ধন",
    },
];

export default function ActivitiesSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-primary-50/30 relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.25] pointer-events-none"></div>
            <div className="relative max-w-7xl mx-auto px-4">
                <SectionTitle title="আমাদের কার্যক্রম" subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত ধর্মীয়, আধ্যাত্মিক ও সমাজসেবামূলক কার্যক্রম" />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
                    {activities.map((item, i) => (
                        <div key={item.title} className="group relative rounded-[28px] bg-white border border-gray-100 p-[1px] shadow-sm hover:shadow-2xl hover:shadow-primary-950/10 hover:-translate-y-1 transition-all overflow-hidden">
                            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.color}`}></div>
                            <div className="relative h-full rounded-[27px] p-6 pt-8 overflow-hidden">
                                <div className="absolute right-0 top-0 w-28 h-28 rounded-full bg-primary-50 -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform"></div>
                                <div className="relative flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <span className="inline-flex text-[10px] font-black text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full mb-3">{item.note}</span>
                                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-550 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                                <div className="relative mt-6 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400">কার্যক্রম {i + 1}</span>
                                    <span className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.color}`}></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
