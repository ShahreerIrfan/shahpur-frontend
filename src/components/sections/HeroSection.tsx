"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaBookOpen, FaChevronLeft, FaChevronRight, FaMosque } from "react-icons/fa";
import { fetchHomeSlides, HomeSlide, slideImageUrl } from "@/lib/appearance";

const fallbackSlide: HomeSlide = {
  id: 0,
  eyebrow: "আধ্যাত্মিক সাধনার কেন্দ্র",
  title: "শাহপুর দরবার\nশরীফ",
  subtitle: "কুমিল্লার গোমতী নদী তীরবর্তী ইসলামী শরীয়াতের অনুশীলন, কাদেরীয়া তরিকার প্রচার ও আধ্যাত্মিক সাধনার ঐতিহাসিক কেন্দ্র",
  image: null,
  primary_button_text: "বাগদাদী হুজুর (রাঃ) এঁর জীবনী",
  primary_button_url: "/biography/baghdadi",
  secondary_button_text: "মাও. আব্দুস সুবহান (রাঃ)",
  secondary_button_url: "/biography/subhan",
  stat_one_value: "৪০+",
  stat_one_label: "মাদ্রাসা",
  stat_two_value: "১৫০+",
  stat_two_label: "খানকাহ শরীফ",
  stat_three_value: "১৭+",
  stat_three_label: "দেশ সফর",
  link: "",
  order: 0,
  is_active: true,
};

export default function HeroSection() {
  const [slides, setSlides] = useState<HomeSlide[]>([fallbackSlide]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchHomeSlides()
      .then((items) => {
        if (mounted && items.length > 0) {
          setSlides(items);
          setActiveIndex(0);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] || fallbackSlide;
  const stats = useMemo(
    () => [
      { value: activeSlide.stat_one_value, label: activeSlide.stat_one_label },
      { value: activeSlide.stat_two_value, label: activeSlide.stat_two_label },
      { value: activeSlide.stat_three_value, label: activeSlide.stat_three_label },
    ].filter((item) => item.value || item.label),
    [activeSlide]
  );

  const goToSlide = (direction: "prev" | "next") => {
    setActiveIndex((current) => {
      if (direction === "prev") return current === 0 ? slides.length - 1 : current - 1;
      return (current + 1) % slides.length;
    });
  };

  return (
    <section className="relative min-h-[580px] flex items-center overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url('${slideImageUrl(slide)}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60" />
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-300/40">
            <FaMosque className="text-primary-600" />
            <span className="text-sm text-primary-700 font-medium">{activeSlide.eyebrow || fallbackSlide.eyebrow}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-800 whitespace-pre-line">
            {activeSlide.title}
          </h1>

          <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
            {activeSlide.subtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {activeSlide.primary_button_text && activeSlide.primary_button_url && (
              <Link
                href={activeSlide.primary_button_url}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 shadow-lg shadow-primary-500/20"
              >
                <FaBookOpen />
                {activeSlide.primary_button_text}
              </Link>
            )}
            {activeSlide.secondary_button_text && activeSlide.secondary_button_url && (
              <Link
                href={activeSlide.secondary_button_url}
                className="inline-flex items-center gap-2 border-2 border-primary-300 hover:bg-primary-50 text-primary-700 px-6 py-3 rounded-lg font-medium transition-all"
              >
                {activeSlide.secondary_button_text}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-8 pt-4">
            {stats.map((stat, index) => (
              <div key={`${stat.label}-${index}`}>
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToSlide("prev")}
              className="w-10 h-10 rounded-full bg-white/80 border border-primary-100 text-primary-700 shadow-sm hover:bg-white flex items-center justify-center"
              aria-label="Previous slide"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-primary-500" : "w-2.5 bg-primary-200"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToSlide("next")}
              className="w-10 h-10 rounded-full bg-white/80 border border-primary-100 text-primary-700 shadow-sm hover:bg-white flex items-center justify-center"
              aria-label="Next slide"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
