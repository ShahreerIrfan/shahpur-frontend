import SpaLink from "@/components/SpaLink";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import SectionTitle from "@/components/ui/SectionTitle";

export default function BiographiesSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="মহান সাধকগণ" subtitle="শাহপুর দরবার শরীফের আধ্যাত্মিক ধারার মহান ব্যক্তিত্বগণ" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Baghdadi */}
                    <article className="group relative bg-gradient-to-br from-primary-50 via-white to-primary-50/30 rounded-2xl p-8 border border-primary-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="relative">
                            <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 border-2 border-primary-200 shadow-md">
                                <Image
                                    src="/images/ahmed-peyara.jpeg"
                                    alt="আল্লামা ড. বাগদাদী (রাঃ)"
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-primary-800 mb-1">
                                আল্লামা ড. আহমদ পেয়ারা বাগদাদী (রাঃ)
                            </h3>
                            <p className="text-sm text-primary-600 mb-2">মেহমানে গাউছুল আজম | আন্তর্জাতিক ইসলাম প্রচারক</p>
                            <p className="text-xs text-gray-500 mb-3">১৯৩৮ - ২০০৫ ঈসায়ী</p>
                            <p className="text-gray-600 text-sm leading-relaxed mb-5">
                                আন্তর্জাতিক ইসলাম প্রচারক, বহু ইসলামী গ্রন্থের প্রণেতা, ভাষাবিদ ও বিজ্ঞানী। চেকোস্লোভাকিয়ার Academy of Science থেকে Radiation Biology বিষয়ে পিএইচ.ডি অর্জন করে বিশ্ব রেকর্ড স্থাপন করেন।
                            </p>
                            <SpaLink
                                href="/biography/baghdadi"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:gap-3 transition-all"
                            >
                                বিস্তারিত পড়ুন <FaArrowRight className="w-3 h-3" />
                            </SpaLink>
                        </div>
                    </article>

                    {/* Subhan */}
                    <article className="group relative bg-gradient-to-br from-primary-50 via-white to-primary-50/30 rounded-2xl p-8 border border-primary-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="relative">
                            <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 border-2 border-primary-200 shadow-md bg-primary-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary-600">আ</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary-800 mb-1">
                                হযরত মাওলানা আব্দুস সুবহান আল-কাদেরী (রাঃ)
                            </h3>
                            <p className="text-sm text-primary-600 mb-2">গাউছে জামান | শাহপুর দরবার শরীফের প্রতিষ্ঠাতা</p>
                            <p className="text-xs text-gray-500 mb-3">১৮৭৬ - ১৯৫৫ ঈসায়ী</p>
                            <p className="text-gray-600 text-sm leading-relaxed mb-5">
                                শাহপুর দরবার শরীফের প্রতিষ্ঠাতা। ইসলামী শরীয়াতের অনুশীলন ও কাদেরীয়া তরিকার প্রচারের মাধ্যমে আত্মশুদ্ধি ও আধ্যাত্মিক সাধনার কেন্দ্র হিসেবে দরবার শরীফ প্রতিষ্ঠা করেন।
                            </p>
                            <SpaLink
                                href="/biography/subhan"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:gap-3 transition-all"
                            >
                                বিস্তারিত পড়ুন <FaArrowRight className="w-3 h-3" />
                            </SpaLink>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
