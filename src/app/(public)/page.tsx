import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ActivitiesSection from "@/components/sections/ActivitiesSection";
import QuoteSection from "@/components/sections/QuoteSection";
import BiographiesSection from "@/components/sections/BiographiesSection";
import TimelineSection from "@/components/sections/TimelineSection";
import BooksSection from "@/components/sections/BooksSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <QuoteSection />
      <ActivitiesSection />
      <BiographiesSection />
      <TimelineSection />
      <BooksSection />
    </>
  );
}
