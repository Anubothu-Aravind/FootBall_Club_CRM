import { motion } from "framer-motion";

const OurMission = ({ cmsData }) => {
  const title = cmsData?.mission_title?.value || "Our Mission";
  const text = cmsData?.mission_text?.value || "Develop well-rounded footballers through technical mastery, tactical awareness, and strong character.";
  const cmsBenefits = cmsData?.mission_benefits?.value;

  const defaultBenefitTexts = ["Proper training facilities", "Certified expert coaches", "Competitive league"];
  const benefitTexts = (Array.isArray(cmsBenefits)) ? cmsBenefits.map(b => b.text || b) : defaultBenefitTexts;

  const benefitIcons = [
    (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M11.584 2.376a.75.75 0 0 1 .832 0l9 6a.75.75 0 1 1-.832 1.248L12 3.901 3.416 9.624a.75.75 0 0 1-.832-1.248l9-6Z" />
        <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1 0-1.5h.75v-9.918a.75.75 0 0 1 .634-.74A49.109 49.109 0 0 1 12 9c2.59 0 5.134.202 7.616.592a.75.75 0 0 1 .634.74Zm-7.5 2.418a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Zm3-.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75ZM9 12.75a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z" clipRule="evenodd" />
        <path d="M12 7.875a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
      </svg>
    ),
    (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
      </svg>
    ),
    (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Z" />
      </svg>
    ),
  ];

  const benefits = benefitTexts.map((text, i) => ({
    icon: benefitIcons[i % benefitIcons.length],
    text,
  }));

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
            {title}
          </h2>
          <div className="w-16 h-1 bg-linear-to-r from-orange-600 to-red-600 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {text}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-6 max-md:grid-cols-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-5 bg-orange-50 border border-orange-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-orange-400 hover:-translate-y-1"
            >
              <div className="shrink-0 w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                {benefit.icon}
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {benefit.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurMission;
