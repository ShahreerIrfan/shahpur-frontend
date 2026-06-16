import SectionTitle from "@/components/ui/SectionTitle";

const timeline = [
    { year: "১৮৭৬", event: "গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এর জন্ম" },
    { year: "১৯১৭", event: "প্রথম বিশ্বযুদ্ধে তুরস্কের পক্ষে যুদ্ধ — গাজী উপাধি লাভ" },
    { year: "১৯৩৮", event: "আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ) এর জন্ম" },
    { year: "১৯৫৫", event: "গাউছে জামান হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ) এর ওফাত" },
    { year: "১৯৭৪", event: "বাগদাদী হুজুর ইরাকের বসরা বিশ্ববিদ্যালয়ে অধ্যাপনা শুরু" },
    { year: "১৯৮০", event: "জাতিসংঘে বক্তৃতা ও শাহপুর দরবার শরীফের পীরের দায়িত্ব গ্রহণ" },
    { year: "২০০৫", event: "বাগদাদী হুজুরের ইন্তেকাল — কুমিল্লার ইতিহাসে সর্ববৃহৎ জানাজা" },
];

export default function TimelineSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4">
                <SectionTitle title="ঐতিহাসিক পটভূমি" subtitle="শাহপুর দরবার শরীফের গুরুত্বপূর্ণ ঘটনাবলী" />

                <div className="relative mt-10">
                    {/* Center line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 md:-translate-x-0.5"></div>

                    <div className="space-y-8">
                        {timeline.map((item, i) => (
                            <div key={i} className={`relative flex items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                                {/* Dot */}
                                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow-md md:-translate-x-1/2 z-10"></div>

                                {/* Content */}
                                <div className={`ml-12 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                                    <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                                        <span className="inline-block text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full mb-2">
                                            {item.year}
                                        </span>
                                        <p className="text-gray-700 text-sm">{item.event}</p>
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
