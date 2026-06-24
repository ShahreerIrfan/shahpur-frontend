import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";

const ActivitiesSection = dynamic(() => import("@/components/sections/ActivitiesSection"));
const QuoteSection = dynamic(() => import("@/components/sections/QuoteSection"));
const HomeFeaturedContent = dynamic(() => import("@/components/sections/HomeFeaturedContent"));
const BiographiesSection = dynamic(() => import("@/components/sections/BiographiesSection"));
const TimelineSection = dynamic(() => import("@/components/sections/TimelineSection"));
const BooksSection = dynamic(() => import("@/components/sections/BooksSection"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <QuoteSection />
      <ActivitiesSection />
      <HomeFeaturedContent />
      <BiographiesSection />
      <TimelineSection />
      <BooksSection />
    </>
  );
}
