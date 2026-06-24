import { FaHistory, FaMosque, FaStar, FaUniversity } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

const timeline = [
    { year: "১৮৭৬", event: "গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এর জন্ম", icon: <FaStar className="w-4 h-4" /> },
    { year: "১৯১৭", event: "প্রথম বিশ্বযুদ্ধে তুরস্কের পক্ষে যুদ্ধ — গাজী উপাধি লাভ", icon: <FaHistory className="w-4 h-4" /> },
    { year: "১৯৩৮", event: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এর জন্ম", icon: <FaStar className="w-4 h-4" /> },
    { year: "১৯৫৫", event: "গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এর ওফাত", icon: <FaMosque className="w-4 h-4" /> },
    { year: "১৯৭৪", event: "বাগদাদী হুজুর ইরাকের বসরা বিশ্ববিদ্যালয়ে অধ্যাপনা শুরু", icon: <FaUniversity className="w-4 h-4" /> },
    { year: "১৯৮০", event: "জাতিসংঘে বক্তৃতা ও শাহপুর দরবার শরীফের পীরের দায়িত্ব গ্রহণ", icon: <FaHistory className="w-4 h-4" /> },
    { year: "২০০৫", event: "বাগদাদী হুজুরের ইন্তেকাল — কুমিল্লার ইতিহাসে সর্ববৃহৎ জানাজা", icon: <FaMosque className="w-4 h-4" /> },
];

export default function TimelineSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-[0.25] pointer-events-none"></div>
            <div className="relative max-w-5xl mx-auto px-4">
                <SectionTitle title="ঐতিহাসিক পটভূমি" subtitle="শাহপুর দরবার শরীফের গুরুত্বপূর্ণ ঘটনাবলী" />

                <div className="relative mt-12">
                    <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-primary-600 via-amber-300 to-primary-600 md:-translate-x-1/2"></div>

                    <div className="space-y-6">
                        {timeline.map((item, i) => (
                            <div key={item.year} className="relative grid grid-cols-[48px_1fr] md:grid-cols-[1fr_72px_1fr] gap-4 md:gap-6 items-center">
                                <div className={`hidden md:block ${i % 2 === 0 ? "order-1" : "order-3"}`}>
                                    <div className={`text-sm font-bold text-gray-400 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                                        শাহপুর দরবার শরীফ
                                    </div>
                                </div>

                                <div className="order-1 md:order-2 relative flex justify-center">
                                    <div className="w-11 h-11 rounded-2xl bg-white border-4 border-primary-100 shadow-lg flex items-center justify-center z-10">
                                        <span className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                                            {item.icon}
                                        </span>
                                    </div>
                                </div>

                                <div className={`order-2 ${i % 2 === 0 ? "md:order-3" : "md:order-1"}`}>
                                    <div className="group relative rounded-3xl bg-white border border-primary-100 p-[1px] shadow-sm hover:shadow-xl hover:shadow-primary-950/10 transition-all overflow-hidden">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 via-amber-300 to-primary-600"></div>
                                        <div className="relative rounded-3xl p-5 md:p-6 overflow-hidden">
                                            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary-50 group-hover:scale-125 transition-transform"></div>
                                            <span className="relative inline-flex items-center bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm mb-3">
                                                {item.year}
                                            </span>
                                            <p className="relative text-gray-750 font-semibold leading-relaxed">{item.event}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
