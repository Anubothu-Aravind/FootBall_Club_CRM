import { motion } from "framer-motion";

const defaultPhilosophyPillars = [
  {
    title: "Technical Mastery",
    description:
      "Ball control, first touch, and passing accuracy through focused drills",
    icon: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
    ),
  },
  {
    title: "Tactical Intelligence",
    description:
      "Positional awareness and decision-making in game-realistic scenarios",
    icon: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    title: "Character Building",
    description:
      "Mental resilience, teamwork, and sportsmanship in every session",
    icon: (
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
      </svg>
    ),
  },
];

const CoachingPhilosophy = ({ cmsData }) => {
  const sectionTitle = cmsData?.coaching_title?.value || "Coaching Philosophy";
  const sectionSubtitle = cmsData?.coaching_subtitle?.value || "Age-appropriate training designed to build complete footballers.";
  const cmsPillars = cmsData?.coaching_pillars?.value;

  // Merge CMS text with hardcoded icons
  const philosophyPillars = (Array.isArray(cmsPillars))
    ? cmsPillars.map((p, i) => ({
        ...defaultPhilosophyPillars[i % defaultPhilosophyPillars.length],
        title: p.title || defaultPhilosophyPillars[i % defaultPhilosophyPillars.length]?.title,
        description: p.description || defaultPhilosophyPillars[i % defaultPhilosophyPillars.length]?.description,
      }))
    : defaultPhilosophyPillars;

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
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-6 max-md:grid-cols-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {philosophyPillars.map((pillar, i) => (
            <motion.div
              key={i}
              className="bg-linear-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-orange-400 hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-orange-600 text-white rounded-xl flex items-center justify-center mx-auto mb-5">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {pillar.title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoachingPhilosophy;
