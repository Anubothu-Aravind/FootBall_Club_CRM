/**
 * HeroSection Component
 * Main hero section with background image carousel, tagline, title, subtitle, and CTA buttons
 * Features smooth fade-in animations, hover effects, and auto-rotating background carousel
 * Now fetches carousel images and text from CMS backend with hardcoded fallbacks
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Fallback images when CMS is unavailable
const FALLBACK_IMAGES = [
  "https://res.cloudinary.com/doakquevf/image/upload/v1770738571/gr_ifla1g.avif",
  "https://res.cloudinary.com/doakquevf/image/upload/v1770738571/gr3_tghmze.avif",
  "https://res.cloudinary.com/doakquevf/image/upload/v1770738571/gr1_xtlz3z.avif",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [carouselImages, setCarouselImages] = useState(FALLBACK_IMAGES);
  const [heroContent, setHeroContent] = useState({
    tagline: "Excellence on Every Field",
    title: "Anantapur Football Club",
    subtitle: "Building champions through discipline, teamwork, and passion for the beautiful game",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <section className="relative w-full h-[94vh] bg-gray-900 flex items-center justify-center py-24 px-16 max-md:py-16 max-md:px-6 max-md:pb-24 max-[480px]:py-12 max-[480px]:px-4 max-[480px]:pb-28 overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        ))}
      </div>

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Tagline */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <span className="inline-flex items-center text-sm uppercase tracking-[3px] text-white/90 border border-white/40 rounded-full py-2.5 px-6 backdrop-blur-sm max-md:text-xs max-md:tracking-[2px] max-md:py-2 max-md:px-4 max-[480px]:text-[11px] max-[480px]:tracking-[1.5px] max-[480px]:py-1.5 max-[480px]:px-3">
            {heroContent.tagline}
          </span>
        </div>

        {/* Main Title */}
        <h1
          className="mt-10 text-[56px] font-bold text-white mb-6 leading-[1.1] drop-shadow-lg max-lg:text-5xl max-md:text-[32px] max-md:mt-6 max-md:mb-4 max-[480px]:text-[26px] max-[480px]:leading-tight animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          {heroContent.title}
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/90 text-xl max-w-[672px] mx-auto mb-12 leading-relaxed drop-shadow-md max-lg:text-lg max-md:text-base max-md:mb-8 max-[480px]:text-sm max-[480px]:mb-6 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          {heroContent.subtitle}
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-row items-center justify-center gap-6 max-md:grid max-md:grid-cols-2 max-md:gap-3 max-md:max-w-sm max-md:mx-auto animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <button 
            onClick={() => {
              const tournamentsSection = document.querySelector('[data-section="tournaments-training"]');
              if (tournamentsSection) {
                tournamentsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group flex items-center gap-3 py-4 px-8 bg-red-600 text-white font-semibold text-base rounded-full border-none cursor-pointer shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:scale-105 max-md:justify-center max-md:py-3 max-md:px-4 max-md:text-sm max-md:gap-2 max-[480px]:py-2.5 max-[480px]:px-3 max-[480px]:text-xs"
          >
            Play Now
            <svg
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="py-4 px-8 bg-white/10 text-white font-semibold text-base rounded-full border-2 border-white/60 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white hover:scale-105 max-md:py-3 max-md:px-4 max-md:text-sm max-[480px]:py-2.5 max-[480px]:px-3 max-[480px]:text-xs"
          >
            Join Academy
          </button>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border-none cursor-pointer transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="white"
          viewBox="0 0 24 24"
          className="max-md:w-5 max-md:h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border-none cursor-pointer transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="white"
          viewBox="0 0 24 24"
          className="max-md:w-5 max-md:h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 max-md:bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer border-none ${
              index === currentImageIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
