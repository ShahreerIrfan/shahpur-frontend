import dynamic from "next/dynamic";
import { fetchSlidesServer } from "@/lib/server-api";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";

const ActivitiesSection = dynamic(() => import("@/components/sections/ActivitiesSection"));
const QuoteSection = dynamic(() => import("@/components/sections/QuoteSection"));
const HomeFeaturedContent = dynamic(() => import("@/components/sections/HomeFeaturedContent"));
const BiographiesSection = dynamic(() => import("@/components/sections/BiographiesSection"));
const TimelineSection = dynamic(() => import("@/components/sections/TimelineSection"));
const BooksSection = dynamic(() => import("@/components/sections/BooksSection"));

export default async function Home() {
  const slides = await fetchSlidesServer();

  return (
    <>
      <HeroSection initialSlides={slides} />
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
