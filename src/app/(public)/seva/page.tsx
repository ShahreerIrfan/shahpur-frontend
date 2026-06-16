import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Card from "@/components/ui/Card";
import IconBox from "@/components/ui/IconBox";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "সেবা কার্যক্রম | শাহপুর দরবার শরীফ",
    description: "শাহপুর দরবার শরীফ কর্তৃক জিকরুল্লাহ ইসলামিয়া কমিটির উদ্যোগে পরিচালিত মানবসেবামূলক কার্যক্রম - ত্রাণ বিতরণ, শীতবস্ত্র, ইফতার, কুরবানী।",
    openGraph: {
        title: "সেবা কার্যক্রম | শাহপুর দরবার শরীফ",
        description: "মানবসেবামূলক কার্যক্রম",
    },
};

const sevaItems = [
    {
        title: "দরিদ্রদের স্বাবলম্বী করণ",
        description: "সমাজের দরিদ্র ও অসহায় মানুষদের স্বাবলম্বী করে গড়ে তোলার জন্য বিভিন্ন কার্যক্রম গ্রহণ করা হয়।",
    },
    {
        title: "বন্যার্তদের ত্রাণ ও পুনর্বাসন",
        description: "প্রাকৃতিক দুর্যোগে ক্ষতিগ্রস্ত মানুষদের পাশে দাঁড়িয়ে ত্রাণ সামগ্রী বিতরণ ও পুনর্বাসনে সহায়তা করা হয়।",
    },
    {
        title: "শীতবস্ত্র বিতরণ",
        description: "শীতকালে অসহায় ও দরিদ্র মানুষদের মাঝে শীতবস্ত্র বিতরণ করা হয়।",
    },
    {
        title: "ইফতার বিতরণ",
        description: "পবিত্র রমজান মাসে রোজাদারদের মাঝে ইফতার সামগ্রী বিতরণ করা হয়।",
    },
    {
        title: "অসহায়দের সহায়তা",
        description: "রমজানে অসহায়দের খাদ্য সামগ্রী ও আর্থিক সহায়তা প্রদান করা হয়।",
    },
    {
        title: "কুরবানী কার্যক্রম",
        description: "সবার জন্য কুরবানীসহ বিভিন্ন মানবসেবামূলক কার্যক্রম পরিচালিত হচ্ছে।",
    },
];

export default function SevaPage() {
    return (
        <div className="min-h-screen">
            <PageHero
                title="সেবা কার্যক্রম"
                subtitle="জিকরুল্লাহ ইসলামিয়া কমিটির উদ্যোগে পরিচালিত মানবসেবামূলক কার্যক্রম"
                showBismillah={false}
            />
            <Breadcrumbs items={[{ label: "সেবা কার্যক্রম" }]} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sevaItems.map((item, i) => (
                        <Card key={i}>
                            <IconBox size="sm">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </IconBox>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
