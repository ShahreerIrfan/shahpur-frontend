import { FaBookOpen, FaHeart, FaGlobe, FaUsers, FaHandHoldingHeart, FaPray } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const activities = [
    {
        title: "মাদ্রাসা শিক্ষা",
        description: "প্রায় ৪০টি মাদ্রাসায় দ্বীনি ও নৈতিক শিক্ষার আলো ছড়িয়ে দেওয়া হচ্ছে।",
        icon: <FaBookOpen className="w-6 h-6" />,
        color: "from-emerald-500 to-teal-600",
    },
    {
        title: "সেবা কার্যক্রম",
        description: "দরিদ্রদের স্বাবলম্বী করণ, বন্যার্তদের ত্রাণ ও পুনর্বাসন কার্যক্রম।",
        icon: <FaHeart className="w-6 h-6" />,
        color: "from-rose-500 to-pink-600",
    },
    {
        title: "আন্তর্জাতিক দাওয়াত",
        description: "১৭+ দেশে ইসলামের সুমহান বার্তা ও নবীপ্রেমের দাওয়াত পৌঁছে দেওয়া।",
        icon: <FaGlobe className="w-6 h-6" />,
        color: "from-blue-500 to-indigo-600",
    },
    {
        title: "খানকাহ শরীফ",
        description: "বিশ্বের বিভিন্ন দেশে ১৫০+ কাদেরীয়া তরিকার খানকাহ শরীফ প্রতিষ্ঠা।",
        icon: <FaPray className="w-6 h-6" />,
        color: "from-purple-500 to-violet-600",
    },
    {
        title: "পীর-মুরীদী",
        description: "কাদেরীয়া তরিকায় বায়াত ও আধ্যাত্মিক প্রশিক্ষণের মাধ্যমে আত্মশুদ্ধি।",
        icon: <FaUsers className="w-6 h-6" />,
        color: "from-amber-500 to-orange-600",
    },
    {
        title: "কুরবানী ও ইফতার",
        description: "রমজানে ইফতার বিতরণ ও ঈদুল আযহায় কুরবানী কার্যক্রম পরিচালনা।",
        icon: <FaHandHoldingHeart className="w-6 h-6" />,
        color: "from-cyan-500 to-sky-600",
    },
];

export default function ActivitiesSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="আমাদের কার্যক্রম" subtitle="শাহপুর দরবার শরীফ কর্তৃক পরিচালিত বিভিন্ন ধর্মীয় ও সমাজসেবামূলক কার্যক্রম" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {activities.map((item, i) => (
                        <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
