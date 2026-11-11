import { motion } from "framer-motion";

const defaultStages = [
  {
    step: 1,
    age: "6-8",
    title: "Discovery",
    focus: "Fun & fundamentals",
  },
  {
    step: 2,
    age: "9-12",
    title: "Foundation",
    focus: "Technical skills & teamwork",
  },
  {
    step: 3,
    age: "13-16",
    title: "Development",
    focus: "Advanced tactics & competition",
  },
  {
    step: 4,
    age: "17+",
    title: "Excellence",
    focus: "Elite performance & pathways",
  },
];

const YouthPathway = ({ cmsData }) => {
  const sectionTitle = cmsData?.pathway_title?.value || "Youth Pathway";
  const sectionSubtitle = cmsData?.pathway_subtitle?.value || "Structured progression from grassroots to elite performance.";
  const cmsStages = cmsData?.pathway_stages?.value;
  const stages = (Array.isArray(cmsStages)) ? cmsStages : defaultStages;

  return (
    <section className="py-16 px-6 max-md:py-12 max-[480px]:py-10 bg-linear-to-b from-gray-50 to-white">
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
          <div className="w-16 h-1 bg-linear-to-r from-orange-600 to-red-600 rounded-full mx-auto mb-4"></div>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stages.map((stage, i) => (
            <motion.div
              key={stage.step}
              className="bg-white rounded-2xl p-6 text-center border-2 border-orange-200 transition-all duration-300 hover:shadow-xl hover:border-orange-400 hover:-translate-y-2 hover:bg-orange-50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Step number */}
              <div className="w-12 h-12 bg-linear-to-br from-orange-600 to-red-600 text-white rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-md">
                {stage.step}
              </div>

              {/* Age badge */}
              <div className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                Age {stage.age}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {stage.title}
              </h3>

              {/* Focus area */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {stage.focus}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default YouthPathway;
