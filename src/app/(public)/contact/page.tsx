import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ContactInfo from "@/components/sections/ContactInfo";
import ContactForm from "@/components/sections/ContactForm";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "যোগাযোগ | শাহপুর দরবার শরীফ",
    description: "শাহপুর শাহপুর দরবার শরীফ-৩৫০০, ওয়ার্ড - ৫, পাঁচথুবি, কুমিল্লা আদর্শ সদর, কুমিল্লা - এর সাথে যোগাযোগ করুন।",
    openGraph: {
        title: "যোগাযোগ | শাহপুর দরবার শরীফ",
        description: "আমাদের সাথে যোগাযোগ করুন",
    },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen">
            <PageHero title="যোগাযোগ" subtitle="আমাদের সাথে যোগাযোগ করুন" showBismillah={false} />
            <Breadcrumbs items={[{ label: "যোগাযোগ" }]} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ContactInfo />
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
