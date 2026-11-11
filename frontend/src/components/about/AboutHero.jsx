import { motion } from "framer-motion";

const AboutHero = ({ cmsData }) => {
  // CMS-driven content with hardcoded fallbacks
  const badge = cmsData?.hero_badge?.value || "Since 2016";
  const title = cmsData?.hero_title?.value || "Building Character Through";
  const titleHighlight = cmsData?.hero_title_highlight?.value || "Football Excellence";
  const subtitle = cmsData?.hero_subtitle?.value || "A proven pathway from grassroots development to competitive success for young footballers in Anantapur.";
  const ctaText = cmsData?.hero_cta_text?.value || "Explore Our Journey";

  // Stats from CMS or fallback
  const defaultStats = [
    { value: "500+", label: "Athletes Trained" },
    { value: "8+", label: "Years Proven" },
    { value: "50+", label: "Titles Won" },
  ];
  const stats = (cmsData?.hero_stats?.value && Array.isArray(cmsData.hero_stats.value))
    ? cmsData.hero_stats.value
    : defaultStats;

  const scrollToJourney = () => {
    const journeySection = document.getElementById("our-journey");
    journeySection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-16 px-6 max-md:py-12 max-[480px]:py-10 text-center relative overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Purpose Badge */}
          <motion.span
            className="inline-block bg-orange-100 border border-orange-300 text-orange-700 py-2 px-5 rounded-full text-xs font-semibold tracking-wide mb-6 uppercase"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {badge}
          </motion.span>

          {/* Headline - Purpose-driven */}
          <motion.h1
            className="text-5xl font-extrabold leading-tight mb-4 text-gray-900 max-md:text-4xl max-[480px]:text-3xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {" "}
              {titleHighlight}
            </span>
          </motion.h1>

          {/* One-sentence subtext */}
          <motion.p
            className="text-lg text-gray-700 max-w-2xl mx-auto mb-8 max-md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {subtitle}
          </motion.p>

          {/* Stats with micro-labels */}
          <motion.div
            className="flex justify-center items-center gap-8 flex-wrap mb-8 max-[480px]:gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="contents">
                {i > 0 && <div className="w-px h-10 bg-gray-300 max-[480px]:hidden"></div>}
                <div className="text-center min-w-25">
                  <div className="text-4xl font-black text-orange-600 leading-none mb-1 max-[480px]:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA - Large tap target (Fitts's Law) */}
          <motion.button
            onClick={scrollToJourney}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 min-h-12 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            aria-label={ctaText}
          >
            {ctaText}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
