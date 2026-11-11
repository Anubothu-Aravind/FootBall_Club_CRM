import { motion } from "framer-motion";

const defaultJourneyItems = [
  {
    year: "2016",
    title: "Founded",
    description: "Established with vision to nurture young talent",
  },
  {
    year: "2018",
    title: "First Trophy",
    description: "Won regional tournament championship",
  },
  {
    year: "2020",
    title: "Facility Upgrade",
    description: "Opened dedicated training grounds",
  },
  {
    year: "2022",
    title: "State Recognition",
    description: "Official accreditation achieved",
  },
  {
    year: "2024",
    title: "Global Network",
    description: "International club partnerships formed",
  },
  {
    year: "2025",
    title: "Future Vision",
    description: "Advanced analytics systems launched",
  },
];

const OurJourney = ({ cmsData }) => {
  const sectionTitle = cmsData?.journey_title?.value || "Our Journey";
  const sectionSubtitle = cmsData?.journey_subtitle?.value || "From humble beginnings to regional success-a decade of growth.";
  const cmsItems = cmsData?.journey_items?.value;
  const journeyItems = (Array.isArray(cmsItems)) ? cmsItems : defaultJourneyItems;

  return (
    <section
      id="our-journey"
      className="py-16 px-6 max-md:py-12 max-[480px]:py-10 bg-linear-to-b from-orange-50 to-white scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold mb-4 text-gray-900 max-md:text-3xl max-[480px]:text-2xl">
            {sectionTitle}
          </h2>
          <div className="w-16 h-1 bg-linear-to-r from-orange-600 to-red-600 rounded-full mx-auto mb-4"></div>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Timeline - Compressed height */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7.5 top-0 bottom-0 w-0.5 bg-linear-to-b from-orange-300 via-orange-400 to-orange-300 max-md:left-5"></div>

          <div className="space-y-6">
            {journeyItems.map((item, i) => (
              <motion.div
                key={i}
                className="relative flex items-start gap-6 max-md:gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Year badge */}
                <div className="shrink-0 w-15 h-15 bg-linear-to-br from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10 max-md:w-10 max-md:h-10 max-md:text-xs">
                  {item.year}
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white border-2 border-orange-200 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:border-orange-400 hover:-translate-y-1 max-md:p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 max-md:text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 max-md:text-xs">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurJourney;
