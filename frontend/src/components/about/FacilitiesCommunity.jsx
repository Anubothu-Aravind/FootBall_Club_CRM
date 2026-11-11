import { motion } from "framer-motion";

const defaultFacilities = [
  {
    title: "STATE-Grade Pitches",
    description: "Good ground in state grade pitches",
    icon: (
      <>
        <path d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
        <path
          fillRule="evenodd"
          d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z"
          clipRule="evenodd"
        />
        <path d="M12 7.875a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
      </>
    ),
  },
  {
    title: "Certified Coaches",
    description: "AIFF licensed professionals",
    badge: "Verified",
    icon: (
      <>
        <path
          fillRule="evenodd"
          d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
          clipRule="evenodd"
        />
        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
      </>
    ),
  },
  {
    title: "Year-Round Programs",
    description: "Flexible schedules for all levels",
    icon: (
      <>
        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
        <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
      </>
    ),
  },
];

const defaultTrustBadges = [
  { label: "State Accredited", icon: "✓" },
  { label: "50+ Titles", icon: "*" },
  { label: "8+ Years", icon: "*" },
];

const FacilitiesCommunity = ({ cmsData }) => {
  const sectionTitle = cmsData?.facilities_title?.value || "Facilities & Community";
  const cmsBadges = cmsData?.facilities_badges?.value;
  const cmsFacilities = cmsData?.facilities_items?.value;

  const trustBadges = (Array.isArray(cmsBadges)) ? cmsBadges : defaultTrustBadges;

  // Merge CMS text with hardcoded icons
  const facilities = (Array.isArray(cmsFacilities))
    ? cmsFacilities.map((f, i) => ({
        ...defaultFacilities[i % defaultFacilities.length],
        title: f.title || defaultFacilities[i % defaultFacilities.length]?.title,
        description: f.description || defaultFacilities[i % defaultFacilities.length]?.description,
        badge: f.badge || defaultFacilities[i % defaultFacilities.length]?.badge,
      }))
    : defaultFacilities;

  return (
    <section className="py-16 px-6 max-md:py-12 max-[480px]:py-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold mb-4 text-gray-900 max-md:text-3xl max-[480px]:text-2xl">
            {sectionTitle}
          </h2>
          <div className="w-16 h-1 bg-linear-to-r from-orange-600 to-red-600 rounded-full mx-auto mb-6"></div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-6 flex-wrap mb-8">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-orange-100 border border-orange-300 px-4 py-2 rounded-full"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {facilities.map((facility, i) => (
            <motion.div
              key={i}
              className="bg-linear-to-br from-white to-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:border-orange-400 hover:-translate-y-2 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {facility.badge && (
                <div className="absolute top-3 right-3">
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    {facility.badge}
                  </span>
                </div>
              )}
              <div className="w-14 h-14 mx-auto mb-4 text-orange-600 flex items-center justify-center bg-orange-100 rounded-xl">
                <svg
                  className="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {facility.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {facility.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {facility.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FacilitiesCommunity;
